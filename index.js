import fs from 'fs'; // File System module for writing to files
import path from 'path'; // Path module for handling and transforming file paths
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import db from "./_db.js";
import mongoose from 'mongoose'

// Connect to mongoDb database
mongoose.connect('mongodb://127.0.0.1:27017/gamesCon');
const Games = mongoose.model('Games', new mongoose.Schema({ 
  id: String,
  title: String,
  platform: [String] 
}));
const Reviews = mongoose.model('Reviews', new mongoose.Schema({ 
  id: String,
  rating: Number,
  content: String,
  game_id: String,
  author_id: String
 }));
const Authors = mongoose.model('Authors', new mongoose.Schema({ 
  id: String,
  name: String,
  verified: Boolean
 }));

// types
import { typeDefs } from "./schema.js";
import internal from 'stream';
import { getArgumentValues } from 'graphql';

// resolvers
const resolvers = {
    Query: {
        // query for all the games
        async games(){
            return await Games.find({});
        },
        // query for all the reviews
        async reviews(){
            return await Reviews.find({});
        },
        // query for all the authors
        async authors(){
            return await Authors.find({});
        },
        async review(_, args) {
          return await Reviews.findOne({ id: args.id });
      },
      async game(_, args) {
          return await Games.findOne({ id: args.id });
      },
      async author(_, args) {
          return await Authors.findOne({ id: args.id });
      }
  },
  Game: {
      async reviews(parent) {
          return await Reviews.find({ game_id: parent.id });
      }
  },
  Author: {
      async reviews(parent) {
          return await Reviews.find({ author_id: parent.id });
      }
  },
  Review: {
      async author(parent) {
          return await Authors.findOne({ id: parent.author_id });
      },
      async game(parent) {
          return await Games.findOne({ id: parent.game_id });
      }
    },
    Mutation: {
      async addGame(_, args) {
          let game = new Games({
              ...args.game,
              id: Math.floor(Math.random() * 10000).toString()
          });
          await game.save();
          return game;
      },
      async updateGame(_, args) {
          let game = await Games.findOneAndUpdate({ id: args.id }, args.edits, { new: true });
          return game;
      },
      async deleteGame(_, args) {
          let game = await Games.findOneAndDelete({ id: args.id });
          return await Games.find({});
      },
      async addReview(_, args) {
          let review = new Reviews({
              id: Math.floor(Math.random() * 10000).toString(),
              ...args.review,
              author_id: args.others.author_id,
              game_id: args.others.game_id
          });
          await review.save();
          return review;
      },
      async deleteReview(_, args) {
          let review = await Reviews.findOneAndDelete({ id: args.id });
          return await Reviews.find({});
      },
      async addAuthor(_, args) {
          let author = new Authors({
              id: Math.floor(Math.random() * 10000).toString(),
              ...args.author
          });
          await author.save();
          return author;
      },
      async updateAuthor(_, args) {
          let author = await Authors.findOneAndUpdate({ id: args.id }, args.edits, { new: true });
          return author;
      },
      async deleteAuthor(_, args) {
          let author = await Authors.findOneAndDelete({ id: args.id });
          return await Authors.find({});
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