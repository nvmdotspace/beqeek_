let curlGetRoles = `
curl 'https://app.o1erp.com/api/workspace/732878538910205325/workspace/get/p/team_roles' \
  -H 'accept: */*' \
  -H 'accept-language: vi,en-US;q=0.9,en;q=0.8' \
  -H 'authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJiciI6IjEiLCJpc3MiOiJodHRwczovL2FwcC5vMWVycC5jb20iLCJ0eXBlIjoyLCJ1c2VySWQiOiI4MDYwNzUyMDQwNTE2NjQ4OTciLCJpYXQiOjE3NjMwMzk4MzQsImV4cCI6IjIwMjUtMTEtMTNUMTM6MjI6MTQuODM5NTQ2WiJ9.6vWWu87CZkvlgc17hwwuXokhS2nWz-7TGifD9L-2y0w' \
  -H 'content-type: application/json' \
  -H 'origin: https://beqeek.com' \
  -H 'priority: u=1, i' \
  -H 'referer: https://beqeek.com/' \
  -H 'sec-ch-ua: "Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: cross-site' \
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36' \
  -H 'x-encrypted: pyu1_glxqd_zby_oy_dypqs_u23w5q7l' \
  --data-raw '{"constraints":{"workspaceTeamId":"806075211030986753"},"queries":{"fields":"id,workspaceTeamId,roleCode,roleName,roleDescription"}}'
`
let getRes = {
    "httpCode": 200,
    "status": "success",
    "data": [
        {
            "id": "806075211488165889",
            "workspaceTeamId": "806075211030986753",
            "roleCode": "Admin",
            "roleName": "Admin",
            "roleDescription": "asdasd"
        }
    ],
    "meta": {
        "limit": 1000
    }
}
