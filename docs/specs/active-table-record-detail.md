Analyze the image and rebuild the design of the Active Tables Record Detail screen.
This screen has two issues:

The table display looks bad.

The comment section has the same problem.

The API response is not displayed properly, possibly because the encryption-core package isn’t working correctly.

Please refer to QUICK-VISUAL-SUMMARY.md(/Users/macos/Workspace/buildinpublic/beqeek/docs/specs/QUICK-VISUAL-SUMMARY.md), section VIEW TYPES, to understand how it should be handled.
Also, review the old source code (/Users/macos/Workspace/buildinpublic/beqeek/docs/technical/html-module) related to Active Tables to understand the data display encryption flow.

Please remove all the old code on this screen, including the table, kanban, and comment sections, and rebuild it from scratch.
Use TanStack Table (https://ui.shadcn.com/docs/components/data-table
).
