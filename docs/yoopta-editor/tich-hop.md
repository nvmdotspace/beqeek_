# Tích hợp Yoopta-Editor@v4

Ref: https://github.com/yoopta-editor/Yoopta-Editor

## Viết package mới beqeek-editor

- Tạo package mới `beqeek-editor`
- Phục vụ 1 mục đích
  - Cung cấp việc viết tài liệu tương tự notion (tập trung vào Large documents)

## Yêu cầu

- Cài đặt full tính năng của thư viện Yoopta-Editor

```

Easy setup
Default list of powerful plugins
Many typical solved problems in UX behaviour.
Media plugins on steroids with optimization and lazy loadings
Code plugin on steroids with themes and languages
Each plugin can be easily customized and extensible
Drag and drop, nested dnd is supported also
Selection box for manipulating multiple blocks at once
You can create your own plugin
A list of useful tools (ActionMenu, Toolbar etc.) for the convenience of working with the editor
Automatic lazy loading for media components (eg. embeds)
Large documents
Mobile friendly
Indent and outdent for every plugin by tabs and shift+tabs
Editor instance to programmatically control your content
Editor events for saving to DB in real-time
Exports in markdown, html, plain text
Shortcuts, hotkeys. And customization for this!
Super AI tools not for HYPE, but for real useful work with editor content - [in progress]
The soul invested in the development of this editor 💙
... and other features that I forgot to write about in this list 😅. Just check it in examples!

Core

@yoopta/editor
@yoopta/exports
@yoopta/email-builder
Plugins

@yoopta/paragraph
@yoopta/blockquote
@yoopta/accordion
@yoopta/divider
@yoopta/table
@yoopta/code
@yoopta/embed
@yoopta/image
@yoopta/link
@yoopta/file
@yoopta/callout
@yoopta/video
@yoopta/lists
@yoopta/headings
Tools

@yoopta/action-menu-list
@yoopta/toolbar
@yoopta/link-tool
@yoopta/chat-gpt-assistant - soon
Marks

@yoopta/marks - [Bold, Italic, CodeMark, Underline, Strike, Highlight]
```

#### Cài đặt

```
## slate, slate-react, react, react-dom - peer dependencies
## @yoopta/editor - core package
yarn add slate slate-react @yoopta/editor @yoopta/paragraph
# or
npm install slate slate-react @yoopta/editor @yoopta/paragraph
```

Source code tham khảo

- Large documents:
  - https://yoopta.dev/examples/withShadcnUILibrary
  - https://github.com/yoopta-editor/Yoopta-Editor/blob/master/web/next-example/src/components/examples/withShadcnUILibrary/index.tsx
