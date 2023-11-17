import fs from 'fs'; // File System module for writing to files
import path from 'path'; // Path module for handling and transforming file paths
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import db from "./_db.js";

// types
import { typeDefs } from "./schema.js";

// resolvers
const resolvers = {
    Query: {
        // query for all the games
        games(){
            return db.games
        },
        // query for all the reviews
        reviews(){
            return db.reviews
        },
        // query for all the authors
        authors(){
            return db.authors
        },
        review(_, args) {
            return db.reviews.find( (review) => review.id === args.id )
        },
        game(_, args) {
            return db.games.find( (game) => game.id === args.id )
        },
        author(_, args) {
            return db.authors.find( (author) => author.id === args.id )
        }
    },
    Game: {
        reviews(parent) {
            return db.reviews.filter( (r) => r.game_id === parent.id )
        }
    },
    Author: {
        reviews(parent) {
            return db.reviews.filter( (r) => r.author_id === parent.id )
        }
    },
    Review: {
        author(parent) {
            return db.authors.find( (a) => a.id === parent.author_id )
        },
        game(parent) {
            return db.games.find( (g) => g.id === parent.game_id )
        }
    },
    Mutation: {
      addGame(_, args) {
          let game = {
              ...args.game,
              id: Math.floor(Math.random() * 10000).toString()
          }
          db.games.push(game)
          fs.writeFileSync(path.resolve('./_db.js'), `export default ${JSON.stringify(db)}`);
          return game
      },
      updateGame(_,args) {
          db.games = db.games.map((g) => {
              if(g.id === args.id){
                  return {...g, ...args.edits}
              }
              return g
          })
          fs.writeFileSync(path.resolve('./_db.js'), `export default ${JSON.stringify(db)}`);
          return db.games.find((g) => g.id === args.id)
      },
      deleteGame(_, args) {
          db.games = db.games.filter((g) => g.id!=args.id)
          fs.writeFileSync(path.resolve('./_db.js'), `export default ${JSON.stringify(db)}`);
          return db.games
      },
      addReview(_, args){
        let rev = {
          id: Math.floor(Math.random() * 10000).toString(),
          ...args.review,
          author_id: args.others.author_id,
          game_id: args.others.game_id
        }
        db.reviews.push(rev)
        fs.writeFileSync(path.resolve('./_db.js'), `export default ${JSON.stringify(db)}`);
        return rev
      },
      deleteReview(_, args) {
        db.reviews = db.reviews.filter( (r) => r.id != args.id )
        fs.writeFileSync(path.resolve('./_db.js'), `export default ${JSON.stringify(db)}`);
        return db.reviews
      },
      addAuthor(_, args){
        let author = {
          id: Math.floor(Math.random()*10000).toString(),
          ...args.author
        }
        db.authors.push(author)
        fs.writeFileSync(path.resolve('./_db.js'), `export default ${JSON.stringify(db)}`);
        return db.authors.find( (a) => a.id === author.id )
      },
      updateAuthor(_, args){
        db.authors = db.authors.map((a) => {
          if(a.id === args.id){
              return {...a, ...args.edits}
          }
          return a
        })
        fs.writeFileSync(path.resolve('./_db.js'), `export default ${JSON.stringify(db)}`);
        return db.authors.find( (a) => a.id === args.id )
      },
      deleteAuthor(_, args) {
        db.authors = db.authors.filter( (a) => a.id != args.id )
        fs.writeFileSync(path.resolve('./_db.js'), `export default ${JSON.stringify(db)}`);
        return db.authors
      }
  }
}


// server-setup
const server = new ApolloServer({
    typeDefs, // declaration of type of data
    resolvers // declarations of functions to handle query on the data
});

const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 }
})

console.log("Server ready at port", 4000);

/*
mutation updateMutation($edits: EditGameInput!, $id: ID!){
  updateGame(id: $id, edits: $edits) {
    title
    platform
  }
}
{
  "edits": {
    "title": "Marvel's Spiderman 2",
  },
  "id": "1"
}

mutation AddMutation($game: AddGameInput!){
  addGame(game: $game) {
    id,
    title,
    platform
  }
}

mutation DeleteMutation($id: ID!){
  deleteGame(id: $id) {
    id,
    title,
    platform
  }
}

query Example($id: ID!) {
  game(id: $id) {
    title
    reviews {
      rating
      content
    }
  }
}

query Example {
  games {
    title
    reviews {
      rating
      content
    }
  }
}

query- ExampleQuery {
    authors {
        id
        name
    }
    games {
        title
    }
}

query ExampleQuery($id: ID!) {
  review(id: $id) {
    rating
    content
  }
  game(id: $id){
    title
    platform
  }
  author(id: $id){
    name
    verified
  }
}


*/