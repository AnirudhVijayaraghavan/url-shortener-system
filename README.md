# url-shortener-system
A URL shortening service - System Design experiment.
---
Tech. Stack / Concepts used : <br>
a. Javascript <br>
b. NodeJS - Backend <br>
c. PostgreSQL - Database <br>
d. Sequelize ORM - Relational mapping using objects (to make life easier) <br>
e. EJS - Frontend <br>
f. ExpressJS - Routing <br>
g. BuyMeACoffee :) please ? - Dosh <br>
h. RESTful APIs - HTTPS requests <br>
i. DigitalOcean - Deployment <br>
j. Github - <3 VCS <br>
---
1. Clone the repo : <br>
   ``` git clone https://github.com/AnirudhVijayaraghavan/url-shortener-system.git ```
2. Run NPM build command : <br>
   ``` npm install ```
3. Run NPM start command : <br>
   ``` npm start ```
4. There are 5 endpoints to test out : POST/createuser, POST/submiturl, POST/submitpreferredurl, GET/user/getallurls, GET/:shorturlid (redirections).
5. POST/createuser data :
   {
    "username" : "Anirudh V",
    "email" : "aniruasdasASSd@@@gas2@@dma@sil.com",
    "password" : "asdabd@sasASDSA@@sdiu2u",
    "tier_level" : "Tier 2"
   }
6. POST/submiturl data : 
   {
    "longUrl" : "https://chat.openai.com/c/20c1d604-489c-45c3-aa6d-6f85daa6568c"
   }
7. POST/submitpreferredurl data :
   {
    "longUrl" : "https://chat.openai.som/c/20c1d604-489c-4asdasdasdfasdasd8asdasd5sdssdsdsd" ,
    "preferredShorty" : "123as222"    
   }
  
