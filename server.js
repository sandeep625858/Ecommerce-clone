const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const session = require('express-session');
require('dotenv').config();
app.use(express.static('public'));
const bcrypt=require('bcrypt');
const passport = require('passport');
const LocalStrategy=require('passport-local').Strategy
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
const db = require('./config/dbconfig');
const { authenticate } = require('passport');
app.set("view engine", "ejs");
app.get('/', (req, res) => {
    res.sendFile(__dirname+'/public/index.html');
})
const initializePassport = require("./config/auth");
app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get("/login",(req,res)=>{
  res.sendFile(__dirname+'/public/login.html');
})

app.get("/register",(req,res)=>{
  res.sendFile(__dirname+'/public/signup.html');
})


initializePassport(passport);

const {signUp, login } = require("./controllers/auth");

app.post('/register', signUp);
app.post('/login', login);




app.get('/home',(req,res)=>{
  var users=req.user;
  if(users==null|| users.length<=0){
    res.redirect('/');    
  }
  else
  {
    db.query(`SELECT c.quantity from ECOM.cart as c where c.userId="${req.user.data[0].id}"`)
    .then(result=>{
      const len=result.data.length;
      users=req.user.data[0];
      // console.log(users);
      // console.log(len);
      res.render('Home',{users,len});
    })
    .catch(err=>{
      console.log(err);
    })
  }
})





app.get('/product',(req,res)=>{
  db.query('SELECT * FROM ECOM.products')
  .then(result=>{
      if(req.user!=null){
      db.query(`SELECT c.quantity from ECOM.cart as c where c.userId="${req.user.data[0].id}"`)
      .then(results=>{
        const len=results.data.length;
        // console.log(result.data);
        const product=result.data;
        const users=req.user.data[0];
        product.forEach((prod)=>{
          prod.discount=prod.price-prod.currprice;
          prod.saving=Math.floor((prod.discount * 100)/prod.price);
        })
        // console.log(product);
        res.render('products',{product,users,len});
      })
      .catch(e=>{
        console.log(e)
      })
    }
    else
    {
        const product=result.data;
        const users=null;
        const len=null;
        product.forEach((prod)=>{
          prod.discount=prod.price-prod.currprice;
          prod.saving=Math.floor((prod.discount * 100)/prod.price);
        })
        // console.log(product);
        res.render('products',{product,users,len});
    }
  })
  .catch(e=>{
    console.log(e)
  })
})





app.post('/add',(req,res)=>{
  // console.log(req.body);
  db.insert({
    table: "products",
    records: [
      {
        name: req.body.name,
        image: req.body.image,
        price: req.body.price,
        currprice: req.body.currprice,
        category: req.body.category,
        discount: 0,
        saving: 0,
        rating: (Math.floor(Math.random()*50)+50)/10,
        reviews: Math.floor(Math.random()*1000)
      }
    ]
  })
  .then(result=>{
    res.redirect("/product");
  })
  .catch(err=>{
    console.log(err);
  })
})



app.get('/category/:category',(req,res)=>{
  db.query(`SELECT * FROM ECOM.products where category="${req.params.category}"`)
  .then(result=>{
    if(req.user!=null){
      db.query(`SELECT c.quantity from ECOM.cart as c where c.userId="${req.user.data[0].id}"`)
      .then(results=>{
        const len=results.data.length;
        // console.log(result.data);
        const product=result.data;
        const users=req.user.data[0];
        product.forEach((prod)=>{
          prod.discount=prod.price-prod.currprice;
          prod.saving=Math.floor((prod.discount * 100)/prod.price);
        })
        // console.log(product);
        res.render('products',{product,users,len});
      })
      .catch(e=>{
        console.log(e)
      })
    }
    else
    {
        const product=result.data;
        const users=null;
        const len=null;
        product.forEach((prod)=>{
          prod.discount=prod.price-prod.currprice;
          prod.saving=Math.floor((prod.discount * 100)/prod.price);
        })
        // console.log(product);
        res.render('products',{product,users,len});
    }
  })
  .catch(e=>{
    console.log(e)
  })
})


app.post("/add-cart/:id",(req,res)=>{
  db.query(`SELECT * from ECOM.cart where productId="${req.params.id}" and userId="${req.user.data[0].id}"`)
  .then(results=>{
    // console.log(results.data);
    if(results.data.length<1){
      db.insert({
        table: "cart",
        records: [
          {
            productId: req.params.id,
            userId: req.user.data[0].id,
            quantity: 1
          }
        ]
      })
      .then(result=>{
        res.redirect('/product');
      })
      .catch(err=>{
        console.log(err);
      })
    }
    else
    {
      const quan=results.data[0].quantity+1;
      db.query(`update ECOM.cart set quantity=${quan} where id="${results.data[0].id}"`)
      .then(data=>{
        res.redirect('/product');
      })
      .catch(err=>{
        console.log(err);
      })
    }
  })
  .catch(err=>{
    console.log(err);
  })
})


app.get('/cart',(req,res)=>{
  if(req.isAuthenticated()){
    db.query(`SELECT p.id as id,p.currprice as currprice,p.image as image,p.name as name,e.quantity as quantity,p.category as category  FROM ECOM.cart as e left outer join ECOM.products as p where e.productId=p.id and e.userId="${req.user.data[0].id}"`)
    .then(result=>{
      const orders=result.data;
      const user=req.user.data[0];
      // console.log(orders);
      res.render('cart-page',{user,orders});
    })
    .catch(err=>{
      console.log(err);
    })
  }
  else
  {
    res.redirect('/login');
  }
})


app.get('/inc/:id',(req,res)=>{
  db.query(`SELECT c.quantity from ECOM.cart as c where c.productId="${req.params.id}" and c.userId="${req.user.data[0].id}"`)
  .then(result=>{
    const quan=result.data[0].quantity+1;
    db.query(`UPDATE ECOM.cart set quantity="${quan}" where productId="${req.params.id}" and userId="${req.user.data[0].id}"`)
    .then(results=>{
      res.redirect('/cart');
    })
    .catch(err=>{
      console.log(err);
    })
  })
  .catch(err=>{
    console.log(err);
  })
})


app.get('/dec/:id',(req,res)=>{
  db.query(`SELECT c.quantity from ECOM.cart as c where c.productId="${req.params.id}" and c.userId="${req.user.data[0].id}"`)
  .then(result=>{
    const quan=result.data[0].quantity-1;
    if(quan>0){
    db.query(`UPDATE ECOM.cart set quantity="${quan}" where productId="${req.params.id}" and userId="${req.user.data[0].id}"`)
    .then(results=>{
      res.redirect('/cart');
    })
    .catch(err=>{
      console.log(err);
    })
  }
  })
  .catch(err=>{
    console.log(err);
  })
})

app.get('/delete/:id',(req,res)=>{
  db.query(`DELETE  from ECOM.cart where productId="${req.params.id}" and userId="${req.user.data[0].id}"`)
  .then(result=>{
    res.redirect("/cart");
  })
  .catch(err=>{
    console.log(err);
  })
})

app.get('/success',(req,res)=>{
  db.query(`DELETE from ECOM.cart where userId="${req.user.data[0].id}"`)
  .then(result=>{
    res.sendFile(__dirname+'/public/success.html');
  })
  .catch(err=>{
    console.log(err);
  })
})

app.post('/search',(req,res)=>{
  db.query(`SELECT * FROM ECOM.products as e where e.category like '%${req.body.search}%' or e.name like '%${req.body.search}%'`)
  .then(result=>{
    if(req.user!=null){
      db.query(`SELECT c.quantity from ECOM.cart as c where c.userId="${req.user.data[0].id}"`)
      .then(results=>{
        const len=results.data.length;
        // console.log(result.data);
        const product=result.data;
        const users=req.user.data[0];
        product.forEach((prod)=>{
          prod.discount=prod.price-prod.currprice;
          prod.saving=Math.floor((prod.discount * 100)/prod.price);
        })
        // console.log(product);
        res.render('products',{product,users,len});
      })
      .catch(e=>{
        console.log(e)
      })
    }
    else
    {
        const product=result.data;
        const users=null;
        const len=null;
        product.forEach((prod)=>{
          prod.discount=prod.price-prod.currprice;
          prod.saving=Math.floor((prod.discount * 100)/prod.price);
        })
        // console.log(product);
        res.render('products',{product,users,len});
    }
  })
  .catch(err=>{
    console.log(err);
  })
})


app.get('/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        console.log(err);
      }
      else {
        res.redirect('/');
      }
    });
  });


  app.listen(process.env.PORT,()=>{
    console.log(`running in ${process.env.PORT}`);
})