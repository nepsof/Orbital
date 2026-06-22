Recoverable Error


Hydration failed because the server rendered HTML didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:
- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

See more info here: https://nextjs.org/docs/messages/react-hydration-error


+
Client
-
Server
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
Call Stack
15

Show 1 ignore-listed frame(s)
throwOnHydrationMismatch
file:///Users/manzil/Developer/NepSof%20Projects/orbital/frontend/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_058-ah~._.js (3318:56)
beginWork
file:///Users/manzil/Developer/NepSof%20Projects/orbital/frontend/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_058-ah~._.js (6758:918)
runWithFiberInDEV
file:///Users/manzil/Developer/NepSof%20Projects/orbital/frontend/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_058-ah~._.js (965:74)
performUnitOfWork
file:///Users/manzil/Developer/NepSof%20Projects/orbital/frontend/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_058-ah~._.js (9555:97)
workLoopConcurrentByScheduler
file:///Users/manzil/Developer/NepSof%20Projects/orbital/frontend/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_058-ah~._.js (9551:58)
renderRootConcurrent
file:///Users/manzil/Developer/NepSof%20Projects/orbital/frontend/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_058-ah~._.js (9534:71)
performWorkOnRoot
file:///Users/manzil/Developer/NepSof%20Projects/orbital/frontend/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_058-ah~._.js (9061:150)
performWorkOnRootViaSchedulerTask
file:///Users/manzil/Developer/NepSof%20Projects/orbital/frontend/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_058-ah~._.js (10255:9)
MessagePort.performWorkUntilDeadline
file:///Users/manzil/Developer/NepSof%20Projects/orbital/frontend/.next/dev/static/chunks/node_modules_next_dist_compiled_0rpq4pf._.js (2647:64)
div
<anonymous>
MainContent
file:///Users/manzil/Developer/NepSof%20Projects/orbital/frontend/.next/dev/static/chunks/app_0-4psui._.js (2598:227)
FileExplorerContent
file:///Users/manzil/Developer/NepSof%20Projects/orbital/frontend/.next/dev/static/chunks/app_0-4psui._.js (3642:237)
Home
file:///Users/manzil/Developer/NepSof%20Projects/orbital/frontend/.next/dev/static/chunks/app_0-4psui._.js (3695:221)
ClientPageRoot
file:///Users/manzil/Developer/NepSof%20Projects/orbital/frontend/.next/dev/static/chunks/node_modules_next_dist_0z8ikg~._.js (4688:50)