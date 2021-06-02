# Top 3 Things Migration to About Me

This repo is responsible for the migration of all previously added data into the Top 3 Things questionnaire and migrating the data as responses to the first question from the About Me questionnaire, "What matters to me?"

## Set-up

This particular repo does not require too much of a set up apart from setting the variables up correctly in the .env file. 

How to set up? 
* If not present please create the .env file from the root folder of this repo 
* Add the following on one line without the quotation marks: "TOP3THINGS_QUESTIONNAIRE_IDENTIFIER=https://fhir.myhelm.org/questionnaire-identifier|topThreeThings"
* Add the following on a different line without the quotation marks: "ABOUT_ME_QUESTIONNAIRE_IDENTIFIER=https://fhir.myhelm.org/questionnaire-identifier|aboutMe"
* Specify the location of the fhirstore which the migration will be happening on using the "INTERNAL_FHIRSTORE_URL" variable name 
* Specify the location of the private .pem fhirstore key using the "PRIVATE_KEY" variable name (you can find the keys in the [helmrunfiles](https://bitbucket.org/synanetics/helmrunfiles/src/master/) repository)
* Specify the CRON frequency for this job using the "CRON" variable

## Logic

The main file which carries out the logic is the "index.js" file. It follows these steps to achieve its goal of migrating data from the Top 3 Things Questionnaire to the About Me Questionnaire:
1. Obtain questionnaire ID for the top3Things questionnaire by searching for the questionnaire using the FhirDataProvider. 
2. Use this ID to search for all previously submitted QuestionnaireResponses to the top3Things Questionnaire. 
3. Concatenate the answers to the top3Things Questionnaire by joining the answers with a space e.g. "title1 description1 title2 description2".
4. Place the concatenated answer as the response to the first question to the About Me Questionnaire. 
4. Change the "questionnaire" key from {"reference": "Questionnaire/top3ThingsId"} to  {"reference": "Questionnaire/AboutMeId"}.
5. Use the FhirDataProvider to "Update" (PUT) the editted QuestionnaireResponse to the fhirstore. 

## Running locally 

Run the following steps on your command line from the root folder of this repo:
* npm install 
* node index.js

