# Analysis: "Active Tables" Naming and User Comprehension

**Date:** October 28, 2025
**Scope:** Active Tables naming in HRM and future modules (CRM, Finance, etc.)

---

## I. Problem Statement

### 1.1 Core Issue
**The name "Active Tables" may be ineffective from a UX perspective because:**
- **Difficult to Understand:** The term "Active Tables" is ambiguous and not self-explanatory
- **Purpose Unclear:** Users don't immediately know what it's used for
- **Too Technical:** The naming is biased toward technical jargon, not business value
- **Not Representative:** The name doesn't reflect that this is a **self-configurable** and **flexible** tool

---

## II. Detailed Analysis

### 2.1 Problems with the Current Naming

#### **A. Ambiguity**

| Possible Interpretation | Likelihood | Accuracy |
|---|---|---|
| Tables that are **automatically updated** | High | ❌ Wrong |
| Tables that are **currently active/running** | High | ❌ Wrong |
| Tables with **live/real-time data** | Medium | ❌ Wrong |
| Tables for **customizable business processes** | Low | ✅ Correct |

**Conclusion:** Users will have 3-4 different interpretations of "Active Tables," and none of them will be right.

---

#### **B. Lack of Self-Explanation**

Comparison with other terms and their clarity:

```
✅ "Spreadsheet" → Clear: rows, columns, tabular format
✅ "Database Table" → Clear: data storage, structured
✅ "Record" → Clear: unit of data
❌ "Active Tables" → Unclear: What does "active" mean?
```

**Problem:** Users need to ask or guess the purpose instead of understanding immediately.

---

#### **C. Too Technical**

In the current UI design, we see:
- Module name: "Active Tables"
- Sub-categories: "HRM", "CRM" (use cases)
- Individual tables: "Nhân sự" (Employee Profile), "Sự nghiệp" (Work Process), etc.

**Analysis:**
- Business users (HR, Accounting, Sales) **don't care** about technical names
- They care about: "What is this tool for? What can I do with it?"
- "Active Tables" **doesn't answer** these questions

---

#### **D. Doesn't Reflect Business Value**

According to the business requirements document:

| Business Value | Reflected in "Active Tables"? |
|---|---|
| **Self-configurable, no coding needed** | ❌ No |
| **Flexible, changes with business needs** | ❌ No |
| **Business data management** | ❌ No |
| **Process automation** | ❌ No |
| **Sensitive data protection** | ❌ No |

**Conclusion:** The naming doesn't communicate the product's value proposition.

---

### 2.2 Evidence from Design

#### **Current UI Structure:**

```
BEQEEK WORKSPACE
├── Active Tables (12 tables)
│   ├── HRM (3 tables: Employee Profile, Career, Department)
│   ├── CRM (3 tables: Job Title, Reward Policy, Penalty)
│   └── [Future: many more modules]
```

**UX Observations:**
1. **First level:** "Active Tables" - **too abstract**
2. **Second level:** "HRM", "CRM" - **clearer**
3. **Third level:** "Employee Profile", "Career" - **most specific**

→ **Question:** Why do we need the "Active Tables" level? It adds no value!

---

### 2.3 Comparison with Similar Products

#### **Airtable (original product)**
- Main module name: **"Bases"** (databases)
- Purpose: Clearly a data storage location

#### **Notion**
- Main module name: **"Databases"** (databases)
- Or: **"Tables"** (tables) - direct, simple

#### **Smartsheet**
- Name: **"Sheets"** (worksheets)
- Clear spreadsheet-like data management tool

#### **Microsoft Excel Online**
- Name: **"Workbooks"** or **"Sheets"**
- Purpose is obvious

#### **Active Tables (BEQEEK)**
- Name: **"Active Tables"**
- Purpose: **??? Unknown**

→ **Finding:** BEQEEK's naming is **less clear** than competitors.

---

## III. Impact on Users

### 3.1 Non-Technical End Users

| Scenario | Result |
|---|---|
| HR Manager enters BEQEEK for the first time, sees "Active Tables" | 😕 "What is this? I want to see employee records" |
| Accountant searching for where to enter invoices | 😕 "Does Active Tables help me?" |
| Salesperson wanting to manage leads | 😕 "Should I go into Active Tables?" |

**Consequences:**
- ❌ Longer onboarding time
- ❌ Users need additional training
- ❌ Lower adoption rates

---

### 3.2 Administrators

| Task | Does "Active Tables" Help? |
|---|---|
| Setting up HR data structure | ❌ Unclear what "Active" means |
| Configuring access permissions | ❌ Name is irrelevant |
| Integrating with other systems | ❌ Name doesn't explain anything |

---

## IV. Alternative Naming Options

### 4.1 Option 1: **Simplify - "Tables"**

```
BEQEEK WORKSPACE
├── Tables
│   ├── HRM (3 tables)
│   ├── CRM (3 tables)
│   └── [Future]
```

**Advantages:**
- ✅ Short, easy to remember
- ✅ Clear as a data management tool
- ✅ Consistent with Notion, Smartsheet

**Disadvantages:**
- ❌ Doesn't convey automation capability
- ❌ Doesn't suggest interactivity

---

### 4.2 Option 2: **Add Business Context - "Workflows"**

```
BEQEEK WORKSPACE
├── Workflows
│   ├── HRM (3 tables)
│   ├── CRM (3 tables)
```

**Advantages:**
- ✅ Conveys process automation
- ✅ Clearer than "Active Tables"
- ✅ Aligns with business requirements: "process automation"

**Disadvantages:**
- ❌ May be confused with a separate "automation" module
- ❌ Too broad - workflows aren't just data tables

---

### 4.3 Option 3: **Emphasize Customization - "Business Records"**

```
BEQEEK WORKSPACE
├── Business Records
│   ├── HRM (3 tables)
│   ├── CRM (3 tables)
```

**Advantages:**
- ✅ Clear as "business data"
- ✅ Conveys customizable nature
- ✅ Easy for business users to understand

**Disadvantages:**
- ❌ Too generic
- ❌ Longer, harder to remember

---

### 4.4 Option 4: **Keep "Active Tables" + Improve UX**

```
BEQEEK WORKSPACE
├── Active Tables
│   Tooltip/Helper: "Manage business data with automation"
│   ├── HRM (3 tables)
│   ├── CRM (3 tables)
```

**Advantages:**
- ✅ Keeps existing name (no codebase changes)
- ✅ Explains meaning via tooltip/help

**Disadvantages:**
- ❌ Still not self-explanatory
- ❌ Users must find help to understand

---

### 4.5 Option 5: **Remove Abstract Level - Go Directly to Modules**

```
BEQEEK WORKSPACE (no "Active Tables")
├── HRM (3 tables: Employee Profile, Career, Department)
├── CRM (3 tables: ...)
├── Finance (Future: ...)
└── Sales (Future: ...)
```

**Advantages:**
- ✅ **Crystal clear** - users see exactly what they need
- ✅ Reduces one navigation level
- ✅ Similar to Google Workspace, Slack (no "Apps" level)

**Disadvantages:**
- ❌ When there are 20+ modules, the menu gets cluttered
- ❌ May need grouping later (e.g., "HR Suite", "Sales Suite")

---

## V. Recommendations

### 5.1 **Optimal Solution (Recommended)**

**Replace "Active Tables" with:**

```
BEQEEK WORKSPACE
├── 📊 Data & Workflows (or: Modules, Processes, Automation)
│
├── HRM Suite
│   ├── 👥 Employee Profile
│   ├── 📈 Career Management
│   └── 🏢 Department
│
├── CRM Suite
│   ├── 💼 Customers
│   ├── 📞 Deals
│   └── 📋 Projects
│
├── Finance Suite (Future)
│   ├── 💰 Invoices
│   ├── 📊 Budgets
│   └── 📈 Reports
```

**Benefits:**
- ✅ Clear, self-explanatory
- ✅ Easy to extend with CRM, Finance, etc.
- ✅ Users don't need to learn what "Active Tables" means
- ✅ Consistent UX across Workspace, Team, Role (all are clear lists)

---

### 5.2 **If You Must Keep "Active Tables"**

1. **Add icon + explanatory tooltip:**
   ```
   📊 Active Tables
   "Manage business processes with automation capabilities"
   ```

2. **Add onboarding tour:**
   - First-time users see: "Active Tables is where you manage business data"

3. **Update documentation:**
   - Business docs: "Modules" instead of "Active Tables"
   - API docs: keep unchanged

---

### 5.3 **Change Timeline**

#### **Phase 1 (Short-term - 1-2 weeks):**
- Change UI naming from "Active Tables" → "Modules" or "Data & Workflows"
- Update documentation and help text

#### **Phase 2 (Medium-term - when CRM, Finance are ready):**
- Collect user feedback
- Adjust if needed

#### **Phase 3 (Long-term):**
- Optimize Information Architecture based on module count

---

## VI. Supporting Evidence

### 6.1 From BEQEEK Documentation

**From 00-overview.md:**
```
Scope
- End users perform business operations within their assigned workspace.
- Administrators set up organizational structure (team/role),
  process tables, and integrations.
```

**Note:** The term "process tables" is what users care about, not "Active Tables."

---

**From 05-active-tables.md:**
```
Objective
- Allow each department to self-design tables and business process
  operations based on their needs.
```

**Note:** Clearly "business process tables" or "workflow tables," not just "Active Tables."

---

### 6.2 From Business Requirements

```
Key Value Propositions
- **Flexible Data Models**: Support for various field types
- **Enterprise Integration**: Seamless integration with existing systems
- **Scalability**: Designed to handle large datasets and concurrent users
```

**Note:** Nowhere does "Active" or "Tables" appear as a primary value.
The actual values are: flexibility, integration, scalability.

---

## VII. Summary & Conclusion

### 7.1 **Original Question**

> *"If we name it 'Active Tables', will users understand it and be able to use it?"*

**Answer:**

| User Type | Comprehension | Ease of Use |
|---|---|---|
| **Technical users** (Developers, IT Admin) | ✅ Understand | ✅ Easy |
| **Business users** (HR, Accounting, Sales) | ❌ Don't understand | ❌ Difficult |
| **Workspace Administrator** | ⚠️ Partial understanding | ⚠️ Average |

**Conclusion:** **No, the majority of users will not understand what "Active Tables" is or what it's used for.**

---

### 7.2 **Final Recommendation**

**🎯 Recommended Action:**

1. **Change naming from "Active Tables" → "Modules" or "Data & Workflows"**
   - Clearer and self-explanatory
   - Easy to extend for CRM, Finance, etc.

2. **If renaming is not possible, improve UX:**
   - Add explanatory tooltips
   - Add onboarding tour
   - Provide clear help text

3. **Update documentation:**
   - Marketing: emphasize value (flexibility, self-configuration)
   - Training: explain what "Active Tables" means
   - Docs: provide clear usage guidelines

---

### 7.3 **Business Impact**

| Metric | Good Naming | "Active Tables" |
|---|---|---|
| **Time to Value** | ⬇️ Short (users understand immediately) | ⬆️ Long (requires learning) |
| **User Adoption** | ⬆️ High (easy to use) | ⬇️ Low (confusing) |
| **Support Cost** | ⬇️ Low (fewer questions) | ⬆️ High (many questions) |
| **User Satisfaction** | ⬆️ High | ⬇️ Low |

---

## VIII. Appendix: Detailed Competitor Comparison

### Primary Naming from Each Platform

```
Airtable       → "Bases" (databases) - clear, technical
Notion         → "Databases" - clear, direct
Smartsheet     → "Sheets" - clear, familiar
Microsoft 365  → "Workbooks/Sheets" - clear
Google Sheets  → "Sheets" - clear
Zapier         → "Zaps" - explainable (automation)
Make           → "Scenarios" - explainable (workflows)

BEQEEK         → "Active Tables" - ❌ Unclear
```

**Finding:** BEQEEK has the **least clear naming** in this group.

---

## IX. Additional Considerations

### 9.1 Internationalization
- "Active Tables" doesn't translate well to other languages
- "Modules", "Workflows", "Processes" are more universal

### 9.2 Mobile UX
- "Active Tables" is even harder to understand on mobile
- Shorter, clearer names work better on small screens

### 9.3 Search & Discoverability
- Users might search for "data", "tables", "records" but not "active"
- Better naming improves SEO and discoverability

---

## X. References & Source Documents

### Original Documents Used for Analysis
- `00-overview.md` - Business overview
- `05-active-tables.md` - Active Tables requirements
- `active-tables-business-requirements.md` - Detailed business requirements
- `Screenshot_2025-10-28_at_00_37_54.png` - Current UI design

### Recommended Timeline
- **Short-term (1-2 weeks):** Update naming and help text
- **Medium-term (1-2 months):** Gather user feedback
- **Long-term (3-6 months):** Optimize IA and module structure

---

**END OF REPORT**
