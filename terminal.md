~/Developer/NepSof Projects/orbital/frontend  main !2 ?4 ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────── ✔ 
╰─ npm run dev

> frontend@0.1.0 dev
> next dev

▲ Next.js 16.2.6 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://192.168.18.87:3000
- Environments: .env.local
✓ Ready in 382ms

 GET / 200 in 2.5s (next.js: 1989ms, application-code: 467ms)
[browser] Uncaught Error: Hydration failed because the server rendered HTML didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

https://react.dev/link/hydration-mismatch

  ...
    <RedirectErrorBoundary router={{...}}>
      <InnerLayoutRouter url="/" tree={[...]} params={{}} cacheNode={{rsc:{...}, ...}} segmentPath={[...]} ...>
        <SegmentViewNode type="page" pagePath="page.tsx">
          <SegmentTrieNode>
          <ClientPageRoot Component={function Home} serverProvidedParams={{...}}>
            <Home params={Promise} searchParams={Promise}>
              <FilesProvider>
                <FileExplorerContent>
                  <div className="page-shell">
                    <TopBar currentPath="/" filteredFilesCount={0} searchQuery="" ...>
                      <div className="explorer-t...">
                        <div>
                        <div>
                        <div>
                        <div className="desktop-co...">
                          <div className="view-toggle">
                            <button
+                             className={"view-toggle-btn "}
-                             className="view-toggle-btn active"
                              onClick={function onClick}
                            >
                            <button
+                             className="view-toggle-btn active"
-                             className={"view-toggle-btn "}
                              onClick={function onClick}
                            >
                          ...
                        ...
                    <div className="file-explo..." onContextMenu={function onContextMenu}>
                      <LeftSidebar>
                      <main className="explorer-main">
                        <MainContent filteredFiles={[...]} selectedIds={[...]} sortField="name" sortDirection="asc" ...>
                          <main className="explorer-main">
                            <div
+                             className="file-items-container grid-view"
-                             className="file-list-header"
                              onContextMenu={function onContextMenu}
                            >
                              <div
+                               className="empty-state-explorer"
-                               className="col-name clickable"
                              >
+                               <div className="empty-icon-wrapper">
-                               {"Name "}
                                ...
        ...
      ...

    at <unknown> (https://react.dev/link/hydration-mismatch)
    at throwOnHydrationMismatch (file:///Users/manzil/Developer/NepSof Projects/orbital/frontend/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_058-ah~._.js:3318:56)
    at beginWork (file:///Users/manzil/Developer/NepSof Projects/orbital/frontend/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_058-ah~._.js:6758:918)
    at runWithFiberInDEV (file:///Users/manzil/Developer/NepSof Projects/orbital/frontend/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_058-ah~._.js:965:74)
    at performUnitOfWork (file:///Users/manzil/Developer/NepSof Projects/orbital/frontend/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_058-ah~._.js:9555:97)
    at workLoopConcurrentByScheduler (file:///Users/manzil/Developer/NepSof Projects/orbital/frontend/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_058-ah~._.js:9551:58)
    at renderRootConcurrent (file:///Users/manzil/Developer/NepSof Projects/orbital/frontend/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_058-ah~._.js:9534:71)
    at performWorkOnRoot (file:///Users/manzil/Developer/NepSof Projects/orbital/frontend/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_058-ah~._.js:9061:150)
    at performWorkOnRootViaSchedulerTask (file:///Users/manzil/Developer/NepSof Projects/orbital/frontend/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_058-ah~._.js:10255:9)
    at MessagePort.performWorkUntilDeadline (file:///Users/manzil/Developer/NepSof Projects/orbital/frontend/.next/dev/static/chunks/node_modules_next_dist_compiled_0rpq4pf._.js:2647:64)
    at div (<anonymous>)
    at MainContent (file:///Users/manzil/Developer/NepSof Projects/orbital/frontend/.next/dev/static/chunks/app_0-4psui._.js:2598:227)
    at FileExplorerContent (file:///Users/manzil/Developer/NepSof Projects/orbital/frontend/.next/dev/static/chunks/app_0-4psui._.js:3642:237)
    at Home (file:///Users/manzil/Developer/NepSof Projects/orbital/frontend/.next/dev/static/chunks/app_0-4psui._.js:3695:221)
    at ClientPageRoot (file:///Users/manzil/Developer/NepSof Projects/orbital/frontend/.next/dev/static/chunks/node_modules_next_dist_0z8ikg~._.js:4688:50)
