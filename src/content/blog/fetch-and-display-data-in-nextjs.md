---
title: 如何优雅地在NextJs中获取和展示数据
date: 2025-03-19
---
_PS：本文基于 Next15 的 App router，若版本不同情况可能有所不同_

在Nextjs官方文档中，给出了三种不同的数据获取方式

1. 使用 Fetch API 在服务器上获取数据
```tsx
//app/page.tsx
export default async function Page() {
   const data = await fetch('<https://api.vercel.app/blog>')
   const posts = await data.json()
   return (
      <ul>
        {posts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
   )
}
```
2. 使用ORM或数据库在服务器上获取数据
```tsx
//app/page.tsx
import { db, posts } from '@/lib/db'

export default async function Page() {
  const allPosts = await db.select().from(posts)
  return (
	<ul>
	  {allPosts.map((post) => (
		<li key={post.id}>{post.title}</li>
	  ))}
	</ul>
  )
}
```

3. 在客户端获取数据
```tsx
//app/page.tsx
'use client'

import { useState, useEffect } from 'react'

export function Posts() {
  const [posts, setPosts] = useState(null)

  useEffect(() => {
	async function fetchPosts() {
	  const res = await fetch('<https://api.vercel.app/blog>')
	  const data = await res.json()
	  setPosts(data)
	}
	fetchPosts()
  }, [])

  if (!posts) return <div>Loading...</div>

  return (
	<ul>
	  {posts.map((post) => (
		<li key={post.id}>{post.title}</li>
	  ))}
	</ul>
  )
}
```

官方推荐优先从服务端获取数据，这样能够减少客户端负载，提升性能。因此我针对前两种方法讲一下如何优化。

官方给的示例中，直接将获取数据的代码放在了 `page` 中，因为获取数据是异步的，所以要给 `page` 加上 `async`，这样整个页面都是异步的，会在数据获取完成后展示 `page`。

这里以我用 Nextjs 写的blog网站为例，下面是按官方示例来写的。

![image.png](https://blog-images.luckyabner.top/20251029-20251029173402754.png)

这样虽然没问题，但是整个页面都是异步的，尽管页面中的Hero Section是完全静态的内容，也会等待 `posts` 获取完成后才会加载。

![](https://blog-images.luckyabner.top/20251029-202503191256539.png)
因此我们应该做出些优化，只让与数据有关的section是异步的，让页面的其他内容先加载，那么这里就可以用到 Nextjs 中的 `Suspense`，官方介绍如下：

> `<Suspense>` allows you to be more granular about what parts of the page to stream. For example, you can immediately show any page content that falls outside of the `<Suspense>` boundary, and stream in the list of blog posts inside the boundary.

以我的blog为例，我可以把数据获取逻辑放在`PostList`中，将`PostList`作为异步函数，然后用`Suspense`包裹它，实现流式加载。

但是这样就让代码更加混乱了，因为我只想让`PostList`负责UI界面，不涉及数据相关的操作。

为了实现业务分离，我们可以再新建一个异步的 `PostListContainer` 组件，负责处理数据获取逻辑，并返回带有数据的`PostList`组件，如下图所示。

![](https://blog-images.luckyabner.top/20251029-20251029173649178.png)

将原本`Page`上的`async`转移到了`PostListContainer`中，这样一来，不仅实现了业务分离，还实现了页面的流式加载。
![image.png](https://blog-images.luckyabner.top/20251029-20251029173556461.png)