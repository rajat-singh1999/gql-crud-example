import fs from 'fs';
import path from 'path';
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import mongoose from 'mongoose';
import { typeDefs } from "./schema.js";

const connectToDatabase = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/gamesCon');
    console.log('Connected to MongoDB database');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

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

const resolvers = {
  Query: {
    async games() {
      return await Games.find({});
    },
    async reviews() {
      return await Reviews.find({});
    },
    async authors() {
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
    },
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
    },
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

const startServer = async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 }
  });
  console.log("Server ready at", url);
};

const initializeApp = async () => {
  await connectToDatabase();
  startServer();
};

initializeApp();
