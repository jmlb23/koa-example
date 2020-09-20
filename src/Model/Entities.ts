
interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
}


interface Article {
  id: string,
  title: string,
  description: string,
  body: string,
  tagList: string[]
  createdAt: number,
  updatedAt: number,
  favorited: boolean,
  favoritesCount: number,
  userId?: string
}

interface Comment {
  id: string
  createdAt: number,
  updatedAt: number,
  body: string,
  articleId: string
  userId: string
}

export { User, Comment, Article };
