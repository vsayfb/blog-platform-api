## Description

This is an API designed as a monolithic architecture that includes some features found in social media applications. The purpose of my doing this project was simply to explore backend development concepts. I have delved into various aspects and attempted to implement them on my own.

## Requirements

The API integrates with several other APIs.

<div>
<b> Twilio  </b> :  Used for sending SMS to users.
</div>

<br>

<div>
<b> Mailgun  </b> : Used for sending emails to users.
</div>

<br>

<div>
<b> Cloudinary </b> : Used for storing uploaded pictures.
</div>

<br>

<div>
<b> Google OAuth2  </b> : Used for registering users via Google.
</div>

## Tools

<div> 
  You can explore API resources at <b>http://localhost:port/api</b> via Swagger.
</div>

<br>

<div> 
  You can manage data at  <b>http://localhost:8000</b> using PgAdmin.
  <br></br>
  - Email/Username : <b>admin@admin.com</b>
  <br></br>
  - Password : <b>root</b>
</div>

</br>

<div> 
  You can examine cached data at  <b>http://localhost:8001</b> using RedisInsight.
  <br></br>
  - Host : <b>redis-database </b>
  <br></br>
  - Port : <b> 6379</b>
  <br></br>
  - Name : <b>redis</b>
</div>

<br>

<div> 
 <div> You can examine logged data at  <b>http://localhost:8002</b> using Elastic UI.</div>
  </br>
   <div> - URL : <b>http://localhost:9200 </b> </div>
  
  </br>

  <div> - Appname : <b> * </b> </div>

</div>

  </br>

<div> 
 <div> You can examine queues at  <b>http://localhost:15672</b> using RabbitMQ.</div>
  </br>
   <div> - Username : <b>guest </b> </div>
  
  </br>

  <div> - Password : <b>guest </b> </div>

</div>

<br>

## Installation

As I said, the API integrates with several other APIs, like Twilio, Mailgun, Cloudinary, and Google OAuth2. All of these services offer free trials, so you can obtain an API key for each one. Once you have the API keys, you can configure them by referring to their respective documentation.

If you don't obtain the necessary API keys or fail to configure the other APIs, certain features of the API will not function. The project will still work, but, for instance, you won't be able to create accounts since the API verifies users through their email or phone numbers. Additionally, you won't be able to activate Two-Factor Authentication (TFA) without email or mobile phone number verification.

<i>However, you can still create an account using PgAdmin</i>. To do this, visit <b>http://localhost:8000</b>.

Once you obtain the API keys, all you have to do is set the environment variables. There is an example environment file in this repository.

## Running the app

```bash
# development
$ docker compose up

```

## Test

```bash
# tests
$ docker compose -f test-env-compose.yml up --attach app

```
