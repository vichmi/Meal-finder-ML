const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const packageDef = protoLoader.loadSync("recipe_search.proto", {});
const recipeProto = grpc.loadPackageDefinition(packageDef).recipe;

const client = new recipeProto.RecipeSearch(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

client.Search({ query: "spaghetti bolonese", top_k: 5 }, (err, response) => {
    console.log(response)
  if (err) console.error(err);
  else console.log("Results:", response.results);
});
