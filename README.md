# Welcome to the Party Guest Photo Album repository.
## This repository is licensed under the MIT License.

## _Let's learn how to set up the PGPA_

The Party Guest Photo Album is a self-contained free interface reliant on Netlify and CloudFlare R2 Bucket storage. I made it for my needs, which meant for me it was absolutely free, and while the infrastructure I am hereby writing is free, the services it relies upon may not be completely free. To start ***Netlify*** and ***CloudFlare R2*** are free to an extent. *Netlify's free plan* covers up to 300 credits, which will run out fast if the party is big... the second tier is 9$ mth and contains 1000 credits, so it's cheaper than other services. *CloudFlare R2's Free Plan* covers 10GB of storage, 1 million Class A Operations and 10 million Class B Operations... which should be more than enough in general, however, passing that amount it's 0.015$/mth/GB, 4.5$/1m Class A and 0.36$/1m Class B... however I would be surprised if your guests manage to overwhelm the Free Tier. **VERY IMPORTANT. CLOUDFLARE REQUIRES YOU TO PUT YOUR CREDIT/DEBIT CARD IN TO CREATE AN R2 ACCOUNT... THEY WILL NOT CHARGE YOU ANYTHING UNLESS AND UNTIL YOU CROSS THE PREVIOUSLY EXPLAINED LIMITS**

### What you'll need:
- A CloudFlare (dash.cloudflare.com) account.
- A GitHub account. - This will connect to Netlify for Automated Deployment.
- A Netlify (netlify.com) Account.
- About like... 35 or so minutes of patience.

### Let's begin.

#### CloudFlare Setup

- Step 1: Creating the R2 Bucket Storage.
  Go to dash.cloudflare.com and create an account. Here you'll see the CloudFlare Dashboard, on the side you will find the Sidebar, navigate to *Storage and Databases*, then to **R2 Object Storage**. There you will be *prompted to input your **Credit Card** details*. Once completed you will have access to the *R2 Dashboard*, create a new bucket and name it (e.g. johns-birthday, our-wedding, etc...) [**this bucket name is important for later**] set it to **automatic location and standard storage class** this will successfully create the storage where your images will arrive!
- Step 2: Setting up the R2 Storage for API Usage.
  Because we want our guests to use our Photo Album, it must communicate with Netlify so they can use it freely! As such, we must set up our connection.

  - Step 2.1: API Key Configuration.
   On the R2 Dashboard, navigate to the **'Manage API Tokens'** section on the top right. Here you will create a new ***ACCOUNT API TOKEN***, which will need to be named (e.g. NetiflyAccess) and configured for ***OBJECT READ & WRITE***, leave all other settings undisturbed, and click *'Create Account API Token'*. After pressing create, you will be given a series of IDs ***make sure to copy all into a separate text document, as these will only be shown ONCE.*** These IDs are **SECRET** and must only be known by you, or any trusted person helping you set up this system (i.e. Family or Close Friends). These IDs will be helpful later.

  - Step 2.2: CORS Configuration.
    Once the Bucket and API Token have been set up, the next step is setting up our CORS (Cross-Origin Resource Sharing) Configuration. Navigate to the R2 Dashboard, there click on the Bucket we have just created... this will take you to your storage. Here navigate to **Settings** then *CORS Policy* and click EDIT, here you'll have to erase the preexisting code, and instead input the following:
```json
    [
  { "AllowedOrigins": ["*"], "AllowedMethods": ["GET","PUT"], "AllowedHeaders": ["*"] }
    ]
```
   - Step 2.3: Account ID
     Navigate to your R2 Dashboard and find the **R2 Account ID** this is located at the bottom right portion of the dashboard and will be important later.
     
  **WITH THIS YOUR CLOUDFLARE BUCKET IS READY TO RECEIVE YOUR GUESTS' IMAGES**

#### GitHub Setup

The next step in setting up the PGPA is creating your own private GitHub Repository to deploy your own personalized Personal Album. The main way I recommend doing this is: Downloading the ZIP I have provided and creating a Private Repo. To do this follow the next steps:

- Step 1: Create a *GitHub account*.
- Step 2: **Download** the .zip included in this repository.
- Step 3: Navigate to the Top Right, you will find a **+ sign** and press *'add repository'*.
- Step 4: Name the Repository (I suggest using the same name as your bucket, however this is not obligatory)
- Step 5: Upload the .zip file contents to your repository.

**WITH THIS YOUR GITHUB ACCOUNT AND REPOSITORY SETUP IS FINISHED, YOU CAN NOW PROCEED TO COMPLETE YOUR NETIFLY CONNECTION**

#### Netifly Setup

We are almost done! This last step is quick, yet involved. However! With GitHub it is greatly simplified! Connecting the GitHub repository to Netifly makes it available to your guests via a "yoururl.netifly.app" providing a landing static page for them to upload their images 20 at a time, this is the **homestretch**

- Step 1: Create a Netifly Account.
- Step 2: Connecting Netifly to GitHub.

  Once you open your Netifly Account, you will be prompted to **deploy** your first app, amongst the options present, click on **'GitHub'** and follow the prompts to authorize Netifly to connect to your GitHub.
- Step 3: Deploying your Repository.

  Once Authorized, Netifly will show you your *available Repositories*, choose the **repository you created for the PGPA**. Once you have selected the correct repository, you will be taken to a setup screen, **choose a project name** this step is **IMPORTANT** as the project name will be the URL you will utilize (For Example: if your Project Name is johns-birthday your URL will be johns-birthday.netifly.app). Following the naming process you will see a lot of settings, leave these **unmodified**.
  
   - Step 3.1: Environment Variables.

     At the very end of the setup process you will see a section called **'Environment Variables'** these have to be set up for your specific Photo Album. Click on the Environment Variables tab and choose **IMPORT FROM .ENV FILE**, a submenu will appear with a box for your .env settings, before doing anything, **make sure to click the ***CONTAINS SECRETS*** box** and then use the following template:
```
R2_ACCOUNT_ID="yourR2accountID"
R2_ACCESS_KEY_ID="youraccesskey"
R2_SECRET_ACCESS_KEY="yoursecretaccesskey"
R2_BUCKET="yourbucketname"
EVENT_PREFIX="youreventname" (example: birthday-2025, it does not have to be the same as the project name, or bucket name, as this will only be seen by you)
```
  Once completed with the correct information, press **deploy** and your Photo Album will come online in seconds!

#### Accessing your Photo Album

Once all setup is done and your album is deployed you can access the uploader at: **yoururl.netifly.app/guest/** make sure to give your guests the /guest/ URL that way they can access the Uploader directly!

All that remains now is to print QR codes with your URL and enjoy the party! Knowing you've saved some cash.

---

# Further Customization

If you wish to *customize* your photo album uploader, maybe by adding your name or other emojis, you can do so directly via GitHub.

To do so, go to yourRepo/public/guest/index.html and find the following parts of the HTML code:

```html
<div class="card">
      <h1>🎂 Upload a picture from the party!</h1>
      <p class="muted">Take a picture or upload from your gallery... they will be automatically uploaded to our Digital Album!</p>
```

and **correct** the content in h1 to your preferred title, for example:


```html
<div class="card">
      <h1>🎂 Upload a picture from John and Jane's Wedding!</h1>
      <p class="muted">Take a picture or upload from your gallery... they will be automatically uploaded to our Digital Album!</p>
```

you can also **change the paragraph (p)** and add your own message!

---

### Thank you for reading and enjoy your free (or very nearly free) photo album.

#### Remember, all your photos will be available for download at your CloudFlare R2 Bucket!
