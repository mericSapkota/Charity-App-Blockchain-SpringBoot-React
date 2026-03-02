# Charity App #
### This is Charity App Build with Java SpringBoot, React Frontend and Ethereum Smart Contract with HardhatV2 ###
## Demo Video
link: https://youtu.be/82Nh_FLJs8c
## Running the Project ##
.env file for smartcontract
```js
PRIVATE_KEY=wallet_private_key
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
ETHERSCAN_API_KEY=YOUR_API_KEY
```
for backend appliation.properties
```js
spring.application.name=Charity-Blockchain
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.datasource.url=jdbc:mysql://localhost:3306/charity
spring.datasource.username=root
spring.datasource.password=
app.upload.dir=${user.home}/charity/logo
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=meric5sapkota@gmail.com
spring.mail.password=akdt kijn xbmt beyi //this is outdated password so dont waste your time lol
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
```

Then Go to frontend and type following 
```bash
npm run dev
```
The application will be running in port:3000

For backend to successfully run, you need to have 
_mysql server running on port 3306_
