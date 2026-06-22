Analyze existing file explorer state management before changing anything.

Inspect:

- frontend/app/page.tsx
- frontend/app/components/MainContent.tsx
- frontend/app/files/context/FilesContext
- related file services

Implement backend/state support for file operations and per-folder preferences.

Requirements:

1. Add clipboard support
- copy
- cut
- paste

Clipboard must store:
- operation ('copy' | 'cut')
- fileIds
- sourcePath
- timestamp

Use React context or sessionStorage.

2. Add create folder action
- create inside currentPath
- prevent duplicate names
- auto-increment duplicate names:
  Folder
  Folder 2
  Folder 3

3. Delete
- preserve existing delete behavior
- if trash system exists use it
- otherwise keep current delete flow

4. Duplicate
- duplicate file in same folder
- preserve extension
- append:
  copy
  copy 2

5. Persist folder-specific preferences in localStorage

localStorage key:
file-explorer-folder-preferences

Store per-path:
- viewMode
- sortField
- sortDirection

Example:
{
  "/Downloads": {
    "viewMode": "grid",
    "sortField": "modifiedAt",
    "sortDirection": "desc"
  }
}

6. On currentPath change:
restore saved folder preference

7. On changing:
- viewMode
- sortField
- sortDirection

save preference immediately

8. Keep existing global defaults for folders without saved preferences

9. TypeScript strict-safe
- no any
- no breaking existing API
- minimal incremental changes only

10. Return:
- changed files
- summary
- notes