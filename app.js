let express = require('express');
const axios = require('axios');

let app = express();

const nameArgument = process.argv.slice(3);
const name = nameArgument.length > 0 ? nameArgument[0] : '';

function sortByPrice(variants) {
  return variants.sort((a, b) => {
    const priceA = parseFloat(a.price);
    const priceB = parseFloat(b.price);
    return priceA - priceB;
  });
}

function extractVariants(product) {
  return product.variants.edges.map(edge => ({
    id: edge.node.id,
    title: edge.node.title,
    price: edge.node.price,
    productTitle: product.title,
  }));
}

let allVariants = [];

let data = JSON.stringify({
  query: `{
    products(first: 10, query: "title:${name}") {
      nodes {
        id
        title
        variants(first:10){
          edges{
            node{
              id
              title
              price
            }
          }
        }
      }
    }
  }`,
  variables: {}
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://XXXX/admin/api/2024-04/graphql.json',
  headers: { 
    'Content-Type': 'application/json', 
    'X-Shopify-Access-Token': 'XXXX'
  },
  data : data
};

axios.request(config)
.then((response) => {
  const data = response.data.data;
  data.products.nodes.forEach(product => {
    allVariants.push(...extractVariants(product));
  });
  
  allVariants = sortByPrice(allVariants);
  
  allVariants.forEach(variant => {
    console.log(`${variant.productTitle} - ${variant.title} - price $${variant.price}`);
  })
  
})
.catch((error) => {
  console.log(error);
});

app.get('/', function (req, res) {
  res.send('Hello World!');
});
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});