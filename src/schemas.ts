const schemas = {
  users: {
    v1: {
      $jsonSchema: {
        bsonType: "object",
        required: ["_id", "username", "password", "email"],
        properties: {
          username: {
            bsonType: "string",
            description: "unique username",
          },
          password: {
            bsonType: "string",
            description: "password"
          },
          email: {
            bsonType: "string",
            description: "user's email"
          },
        }
      }
    }
  },
  article: {
    v1: {
      $jsonSchema: {
        bsonType: "object",
        required: ["title", "body", "createdAt", "updatedAt", "username"],
        properties: {
          title: {
            bsonType: "string",
            description: "article's title",
          },
          body: {
            bsonType: "string",
            description: "article's content"
          },
          createdAt: {
            bsonType: "long",
            description: "timestamp creation time"
          },
          updatedAt: {
            bsonType: "long",
            description: "timestamp update time"
          },
          username: {
            bsonType: "string",
            description: "username article author"
          },
          comments: {
            bsonType: "object",
            required: ["id", "createdAt", "updatedAt", "body"],
            properties: {
              id: {
                bsonType: "objectId",
                description: "timestamp creation time"
              },
              createdAt: {
                bsonType: "long",
                description: "timestamp creation time"
              },
              updatedAt: {
                bsonType: "long",
                description: "timestamp update time"
              },
              body: {
                bsonType: "string",
                description: "article's content"
              },
              username: {
                bsonType: "string",
                description: "username comment author"
              },
            }
          }
        }
      }
    }
  }
}

export { schemas }