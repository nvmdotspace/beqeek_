# Kanban Drag & Drop - Visual Flow Diagrams

## 1. Overall System Architecture

```mermaid
graph TB
    subgraph Client["Client (Browser)"]
        UI[Kanban UI]
        DND[Drag & Drop Handler]
        ENC[Encryption Module]
        HASH[Hashing Module]
        API[API Client]
        LS[LocalStorage]
    end

    subgraph Server["Server"]
        AUTH[Auth Middleware]
        VAL[Validation]
        DB[(Database)]
    end

    UI -->|User drags card| DND
    DND -->|Get encryption key| LS
    DND -->|Encrypt value| ENC
    DND -->|Hash value| HASH
    ENC -->|Encrypted data| API
    HASH -->|Hashed data| API
    API -->|PATCH request| AUTH
    AUTH -->|Validated| VAL
    VAL -->|Save encrypted data| DB
    DB -->|Success response| API
    API -->|Update UI| UI

    style Client fill:#e3f2fd
    style Server fill:#fff3e0
```

## 2. Drag & Drop Event Flow

```mermaid
sequenceDiagram
    participant User
    participant Card as Kanban Card
    participant Column as Target Column
    participant Handler as Drop Handler
    participant Validator as Validation
    participant Encryptor as Encryption
    participant API as API Client
    participant Server

    User->>Card: Start dragging
    activate Card
    Card->>Card: Set dragging state
    Card->>User: Visual feedback

    User->>Column: Drop card
    activate Column
    Column->>Handler: Drop event

    Handler->>Validator: Check status change
    alt Same status
        Validator-->>Handler: Cancel operation
        Handler-->>User: No action
    else Different status
        Validator-->>Handler: Proceed

        Handler->>Card: Move to new column (UI)
        Handler->>Encryptor: Encrypt new status
        activate Encryptor
        Encryptor->>Encryptor: Get encryption key
        Encryptor->>Encryptor: Encrypt field value
        Encryptor->>Encryptor: Hash field value
        Encryptor-->>Handler: Return payload
        deactivate Encryptor

        Handler->>API: PATCH request
        activate API
        API->>Server: Send encrypted data
        activate Server

        alt Success
            Server->>Server: Validate & save
            Server-->>API: 200 OK
            API-->>Handler: Success
            Handler-->>User: Show success message
        else Error
            Server-->>API: 4xx/5xx Error
            API-->>Handler: Error
            Handler->>Card: Rollback UI
            Handler->>Column: Re-render from server
            Handler-->>User: Show error message
        end
        deactivate Server
        deactivate API
    end

    deactivate Column
    deactivate Card
```

## 3. Encryption Pipeline

```mermaid
flowchart LR
    subgraph Input
        A[Original Value<br/>e.g. 'done']
    end

    subgraph Field Type Check
        B{Field Type?}
    end

    subgraph Encryption Methods
        C1[HMAC-SHA256]
        C2[AES-256-CBC]
        C3[OPE]
        C4[No Encryption]
    end

    subgraph Hashing
        D[HMAC-SHA256<br/>for record_hashes]
    end

    subgraph Output
        E1[Encrypted Value<br/>for record field]
        E2[Hashed Value<br/>for record_hashes]
    end

    A --> B
    B -->|SELECT_ONE<br/>SELECT_LIST| C1
    B -->|SHORT_TEXT<br/>EMAIL<br/>URL| C2
    B -->|INTEGER<br/>NUMERIC<br/>DATE| C3
    B -->|SELECT_ONE_RECORD<br/>WORKSPACE_USER| C4

    C1 --> E1
    C2 --> E1
    C3 --> E1
    C4 --> E1

    A --> D
    D --> E2

    style C1 fill:#ffebee
    style C2 fill:#e8f5e9
    style C3 fill:#e3f2fd
    style C4 fill:#fff3e0
```

## 4. Data Transformation Flow

```mermaid
graph TD
    subgraph Stage1["1️⃣ Initial Data"]
        A[record: status = 'done'<br/>hashed_keywords: empty]
    end

    subgraph Stage2["2️⃣ Field Type Check"]
        B[Field: matrix_quadrant<br/>Type: SELECT_ONE]
    end

    subgraph Stage3["3️⃣ Encryption"]
        C[HMAC-SHA256 'done', key<br/>↓<br/>d96ba1768a0f...]
    end

    subgraph Stage4["4️⃣ Hashing"]
        D[HMAC-SHA256 'done', key<br/>↓<br/>d96ba1768a0f...<br/>same as encrypted]
    end

    subgraph Stage5["5️⃣ Final Payload"]
        E["record: {<br/>  matrix_quadrant: 'd96ba1768a0f...'<br/>}<br/>record_hashes: {<br/>  matrix_quadrant: 'd96ba1768a0f...'<br/>}"]
    end

    A --> B
    B --> C
    B --> D
    C --> E
    D --> E

    style Stage1 fill:#fff3e0
    style Stage2 fill:#e3f2fd
    style Stage3 fill:#ffebee
    style Stage4 fill:#f3e5f5
    style Stage5 fill:#e8f5e9
```

## 5. Encryption Methods Comparison

```mermaid
graph TB
    subgraph Methods["Encryption Methods"]
        direction TB

        subgraph HMAC["HMAC-SHA256"]
            H1[Deterministic]
            H2[One-way hash]
            H3[Equality search ✓]
            H4[Range search ✗]
            H5[Decrypt ✗]
        end

        subgraph AES["AES-256-CBC"]
            A1[Random IV]
            A2[Two-way encryption]
            A3[Equality search ✓ via hash]
            A4[Range search ✗]
            A5[Decrypt ✓]
        end

        subgraph OPE["Order-Preserving Encryption"]
            O1[Deterministic]
            O2[Order-preserving]
            O3[Equality search ✓]
            O4[Range search ✓]
            O5[Decrypt ✓]
        end
    end

    subgraph UseCases["Field Types"]
        U1[SELECT_ONE<br/>SELECT_LIST]
        U2[SHORT_TEXT<br/>EMAIL<br/>URL]
        U3[INTEGER<br/>NUMERIC<br/>DATE<br/>DATETIME]
    end

    HMAC --> U1
    AES --> U2
    OPE --> U3

    style HMAC fill:#ffebee
    style AES fill:#e8f5e9
    style OPE fill:#e3f2fd
```

## 6. Error Handling Flow

```mermaid
flowchart TD
    Start([User drops card]) --> CheckKey{Encryption key<br/>exists?}

    CheckKey -->|No| Error1[Show error:<br/>Table chưa được thiết lập khóa]
    CheckKey -->|Yes| ValidateKey{Key valid?}

    ValidateKey -->|No| Error2[Show error:<br/>Khóa mã hóa không hợp lệ]
    ValidateKey -->|Yes| CheckStatus{Status changed?}

    CheckStatus -->|No| Cancel[Cancel operation<br/>No API call]
    CheckStatus -->|Yes| MoveCard[Move card UI]

    MoveCard --> Encrypt[Encrypt & Hash]
    Encrypt --> APICall[PATCH API call]

    APICall --> CheckResponse{Response OK?}

    CheckResponse -->|200 OK| Success[Show success message<br/>Keep UI state]
    CheckResponse -->|Error| Rollback[Rollback UI<br/>Re-render from server]

    Error1 --> End([End])
    Error2 --> End
    Cancel --> End
    Success --> End
    Rollback --> End

    style Error1 fill:#ffcdd2
    style Error2 fill:#ffcdd2
    style Rollback fill:#fff9c4
    style Success fill:#c8e6c9
```

## 7. Payload Construction Detailed

```mermaid
graph TB
    subgraph Input["Input Parameters"]
        I1[table: Table object]
        I2[recordId: string]
        I3[data: UpdatePayload]
    end

    subgraph Processing["updateRecord Processing"]
        P1[Clone data object]
        P2[For each field in record]
        P3[Get field config]
        P4{Field has value?}
        P5[Call encryptTableData]
        P6[Call hashRecordData]
    end

    subgraph Encryption["encryptTableData"]
        E1{Field type?}
        E2[HMAC-SHA256]
        E3[AES-256-CBC]
        E4[OPE]
        E5[No encryption]
    end

    subgraph Hashing["hashRecordData"]
        H1[For each field]
        H2{Array value?}
        H3[Hash each item]
        H4[Hash single value]
    end

    subgraph Output["Final Payload"]
        O1["record: {<br/>  field: encrypted<br/>}"]
        O2["record_hashes: {<br/>  field: hashed<br/>}"]
        O3[hashed_keywords: object]
    end

    I1 --> P1
    I2 --> P1
    I3 --> P1

    P1 --> P2
    P2 --> P3
    P3 --> P4

    P4 -->|Yes| P5
    P4 -->|No| P2
    P5 --> E1

    E1 -->|SELECT_ONE| E2
    E1 -->|SHORT_TEXT| E3
    E1 -->|INTEGER| E4
    E1 -->|REFERENCE| E5

    E2 --> O1
    E3 --> O1
    E4 --> O1
    E5 --> O1

    P2 --> P6
    P6 --> H1
    H1 --> H2
    H2 -->|Yes| H3
    H2 -->|No| H4

    H3 --> O2
    H4 --> O2

    O1 --> O3
    O2 --> O3

    style Encryption fill:#ffebee
    style Hashing fill:#e8f5e9
    style Output fill:#e3f2fd
```

## 8. State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Idle: Kanban loaded

    Idle --> Dragging: User starts drag
    Dragging --> DragOver: Card over column

    DragOver --> Dragging: Leave column
    DragOver --> Dropped: User drops card

    Dropped --> Validating: Check status change

    Validating --> Idle: Same status (cancel)
    Validating --> Encrypting: Different status

    Encrypting --> Calling: Prepare payload
    Calling --> Waiting: API request sent

    Waiting --> Success: 200 OK
    Waiting --> Error: 4xx/5xx

    Success --> Idle: Update complete
    Error --> Rollback: Restore previous state
    Rollback --> Idle: UI restored

    note right of Encrypting
        Encrypt field value
        Hash for indexing
    end note

    note right of Waiting
        Show loading state
        Disable interactions
    end note

    note right of Rollback
        Remove card from new column
        Re-render from server
        Show error message
    end note
```

## 9. Security Model

```mermaid
graph TB
    subgraph Client["Client (Browser)"]
        CK[Encryption Key<br/>32 characters]
        CLS[LocalStorage]
        CENC[Client-side Encryption]
    end

    subgraph Transit["In Transit"]
        TED[Encrypted Data]
        THD[Hashed Data]
        TSSL[HTTPS/TLS]
    end

    subgraph Server["Server"]
        SAK[Auth Key<br/>SHA256³ key]
        SVA[Validation]
        SDB[(Database<br/>Encrypted)]
    end

    CK -.Store.-> CLS
    CK --> CENC
    CENC -->|Encrypt| TED
    CENC -->|Hash| THD

    TED --> TSSL
    THD --> TSSL
    TSSL --> SVA

    SVA -->|Validate with auth key| SAK
    SAK -.Never stored on server.-> CK
    SVA -->|Save| SDB

    style CK fill:#ffebee
    style SAK fill:#e8f5e9
    style TSSL fill:#e3f2fd
    style SDB fill:#fff3e0

    note1[Encryption key<br/>NEVER sent to server]
    note2[Server cannot<br/>decrypt data]
    note3[End-to-end<br/>encryption]

    CK -.-> note1
    SAK -.-> note2
    TSSL -.-> note3
```

## 10. Debugging Decision Tree

```mermaid
flowchart TD
    Problem([API call fails]) --> Check1{Network error?}

    Check1 -->|Yes| Net[Check internet<br/>Check CORS<br/>Check server status]
    Check1 -->|No| Check2{401 Unauthorized?}

    Check2 -->|Yes| Auth[Check access token<br/>Refresh token<br/>Re-login]
    Check2 -->|No| Check3{400 Bad Request?}

    Check3 -->|Yes| Payload[Inspect payload<br/>Validate encryption<br/>Check field types]
    Check3 -->|No| Check4{403 Forbidden?}

    Check4 -->|Yes| Perm[Check record permissions<br/>Check workspace access<br/>Check field permissions]
    Check4 -->|No| Server[500 Server Error<br/>Contact backend team<br/>Check server logs]

    Payload --> ValidateEnc{Encryption<br/>correct?}
    ValidateEnc -->|No| FixEnc[Check encryption key<br/>Verify field type<br/>Test encrypt/decrypt]
    ValidateEnc -->|Yes| ValidateHash{Hashing<br/>correct?}

    ValidateHash -->|No| FixHash[Check hash function<br/>Verify key usage<br/>Test determinism]
    ValidateHash -->|Yes| ValidateStruct{Payload<br/>structure<br/>correct?}

    ValidateStruct -->|No| FixStruct[Check required fields<br/>Verify JSON format<br/>Match API spec]
    ValidateStruct -->|Yes| Other[Other validation errors<br/>Check error message<br/>Review business logic]

    style Net fill:#ffebee
    style Auth fill:#fff9c4
    style Payload fill:#e3f2fd
    style Perm fill:#f3e5f5
    style Server fill:#ffcdd2
```

## Legend

### Colors in Diagrams

- 🔴 **Red** (#ffebee): HMAC-SHA256 encryption
- 🟢 **Green** (#e8f5e9): AES-256-CBC encryption
- 🔵 **Blue** (#e3f2fd): OPE encryption / Data flow
- 🟡 **Yellow** (#fff3e0): No encryption / Warnings
- 🟣 **Purple** (#f3e5f5): Hashing operations

### Symbols

- `→` : Synchronous flow
- `-.->` : Asynchronous flow / Reference
- `🔒` : Encrypted data
- `#️⃣` : Hashed data
- `⚠️` : Warning / Validation required
- `✓` : Supported operation
- `✗` : Unsupported operation

---

**Note**: These diagrams are written in Mermaid syntax and can be rendered in:

- GitHub (native support)
- GitLab (native support)
- VS Code (with Mermaid extension)
- Online editors (mermaid.live)
