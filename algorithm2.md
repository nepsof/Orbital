# Folder Organization Algorithm

This document explains the folder organization algorithm used by the Organize Folder feature in Orbital.

## Overview

The folder organization system uses a **category-based automatic filing** approach that categorizes files by their file type extensions and automatically creates folders for each category, then moves files into their respective category folders. This is a simple but effective way to automatically organize cluttered directories.

The algorithm works in two phases:

1. **File Categorization** — determine the category for each file based on extension
2. **Automated Movement** — create category folders and move files into them

---

## 1. Category Detection System

Each file is assigned to a category based on its file extension. The categories and their associated extensions are defined as follows:

| Category | Extensions |
|----------|-----------|
| Videos | mp4, mov, avi, mkv, wmv |
| Images | jpg, jpeg, png, gif, webp, svg |
| Audio | mp3, wav, flac, aac, ogg |
| Documents | pdf, doc, docx, txt, rtf, odt |
| Archives | zip, rar, 7z, tar, gz |
| Design | fig, psd, ai, sketch |
| Files | (default for unrecognized types) |
| Folder | (directories - skipped) |

### Pseudocode for Category Detection

```
function getCategory(fileName, isDirectory):
    if isDirectory:
        return "Folder"
    
    ext = getExtension(fileName).toLowerCase()
    
    categories = {
        "Videos": ["mp4", "mov", "avi", "mkv", "wmv"],
        "Images": ["jpg", "jpeg", "png", "gif", "webp", "svg"],
        "Audio": ["mp3", "wav", "flac", "aac", "ogg"],
        "Documents": ["pdf", "doc", "docx", "txt", "rtf", "odt"],
        "Archives": ["zip", "rar", "7z", "tar", "gz"],
        "Design": ["fig", "psd", "ai", "sketch"]
    }
    
    for category, extensions in categories:
        if ext in extensions:
            return category
    
    return "Files"  // default category
```

---

## 2. Main Organization Pipeline

The organize operation processes files in the target directory sequentially. Here's the complete workflow:

### Algorithm Pseudocode

```
function organizeFolder(targetPath):
    if not exists(targetPath) or not isDirectory(targetPath):
        return error("Invalid path")
    
    files = readDirectory(targetPath)
    results = {
        organizedCount: 0,
        skippedCount: 0,
        errorCount: 0,
        details: []
    }
    
    for each fileName in files:
        filePath = joinPath(targetPath, fileName)
        
        try:
            fileStats = getFileStats(filePath)
            
            // Skip directories and symbolic links
            if isDirectory(filePath) or isSymbolicLink(filePath):
                results.skippedCount++
                continue
            
            // Determine category
            category = getCategory(fileName, false)
            
            // Create category folder if needed
            categoryFolder = joinPath(targetPath, category)
            if not exists(categoryFolder):
                createDirectory(categoryFolder)
            
            // Move file to category folder
            destPath = joinPath(categoryFolder, fileName)
            
            // Handle filename conflicts
            finalDestPath = resolveConflict(destPath, fileName, categoryFolder)
            
            // Move the file
            moveFile(filePath, finalDestPath)
            
            // Record success
            results.organizedCount++
            results.details.append({
                fileName: fileName,
                category: category,
                status: "success",
                newPath: finalDestPath
            })
        
        catch error:
            results.errorCount++
            results.details.append({
                fileName: fileName,
                status: "error",
                error: error.message
            })
    
    return results
```

---

## 3. Duplicate Filename Resolution

When a file with the same name already exists in the destination category folder, the algorithm appends a counter to make the filename unique:

### Conflict Resolution Algorithm

```
function resolveConflict(destPath, fileName, categoryFolder):
    if not exists(destPath):
        return destPath  // No conflict
    
    ext = getExtension(fileName)
    nameWithoutExt = removeExtension(fileName)
    
    counter = 1
    while true:
        newName = nameWithoutExt + " (" + counter + ")" + ext
        finalDestPath = joinPath(categoryFolder, newName)
        
        if not exists(finalDestPath):
            return finalDestPath
        
        counter++
```

### Example

If organizing a folder containing:
- `Document.pdf` (already exists in Documents folder)
- New `Document.pdf` to organize

The new file will be renamed to:
- `Document (1).pdf`

If both `Document.pdf` and `Document (1).pdf` exist:
- The next file becomes `Document (2).pdf`

---

## 4. Execution Flow in Orbital

### Frontend Flow

1. User clicks "Organize Folder" button in TopBar
2. Frontend calls `organizePath(currentPath)`
3. Frontend converts virtual path to real filesystem path using monitored folders mapping
4. Sends POST request to `/api/files/organize?path={realPath}`
5. Displays results to user (count of organized, skipped, and error files)
6. Refreshes file view to show new organization

### Backend Flow

1. Receives POST request with target path
2. Validates path exists and is a directory
3. Reads all files in the directory
4. For each file, determines category and moves it
5. Logs the activity in system logs with user ID
6. Returns response with:
   - `organizedCount`: number of successfully moved files
   - `skippedCount`: number of skipped directories/symlinks
   - `errorCount`: number of files that failed to move
   - `details`: array of results for each file

---

## 5. Constraints and Behavior

| Constraint | Behavior |
|-----------|---------|
| **Directories** | Skipped (not moved) |
| **Symbolic Links** | Skipped (not moved) |
| **Root Path ('/')** | Rejected with error message |
| **Unmonitored Path** | Rejected if folder is not in monitored folders list |
| **File Permissions** | Files that cannot be read/written are logged as errors |
| **Duplicate Filenames** | Automatically renamed with counter suffix |

---

## 6. Example Execution

### Initial Folder Structure
```
/Downloads/
  ├── document.pdf
  ├── photo.jpg
  ├── song.mp3
  ├── archive.zip
  ├── design.psd
  └── notes.txt
```

### After Organizing
```
/Downloads/
  ├── Documents/
  │   ├── document.pdf
  │   └── notes.txt
  ├── Images/
  │   └── photo.jpg
  ├── Audio/
  │   └── song.mp3
  ├── Archives/
  │   └── archive.zip
  └── Design/
      └── design.psd
```

### Response
```json
{
  "success": true,
  "message": "Successfully organized 6 files",
  "organizedCount": 6,
  "skippedCount": 0,
  "errorCount": 0,
  "details": [
    { "fileName": "document.pdf", "category": "Documents", "status": "success" },
    { "fileName": "photo.jpg", "category": "Images", "status": "success" },
    { "fileName": "song.mp3", "category": "Audio", "status": "success" },
    { "fileName": "archive.zip", "category": "Archives", "status": "success" },
    { "fileName": "design.psd", "category": "Design", "status": "success" },
    { "fileName": "notes.txt", "category": "Documents", "status": "success" }
  ]
}
```

---

## 7. Time Complexity

- **Time Complexity**: O(n) where n is the number of files in the directory
  - Each file is processed exactly once
  - File system operations (mkdir, rename) are O(1) per file
  - No sorting or comparison between files is needed

- **Space Complexity**: O(n) for storing results array

---

## 8. Advantages and Limitations

### Advantages
✅ Simple and predictable categorization  
✅ Automatic folder creation  
✅ Handles duplicate filenames gracefully  
✅ Fast O(n) execution  
✅ Works across all file types  

### Limitations
⚠️ Only organizes files in one level (doesn't organize subfolders)  
⚠️ Limited to predefined categories (7 categories)  
⚠️ No intelligent grouping by date, size, or custom rules  
⚠️ Cannot move existing folders, only files  
⚠️ Cannot organize root path ("/")  
