# Favor Bank
Favor Bank is a mobile-first app to request and commit to doing favors among your friends. The hours you spend helping and getting helped are a kind of currency: one credit per hour. The app helps you get the word out that you need a favor, lets you sign up to do the favors your friends need, keeps track of your time balance as hours get credited and debited, and gives you access to a dashboard of current favors you've initiated or signed up to do.

## Time Banking
Favor Bank draws on the concept of "[time banking](https://timebanks.org/what-is-timebanking "timebanks.org")," a cashless, community-building way to exchange services. The underlying ideas of time banking are that everyone has something to contribute, an hour of any person's time is worth an hour of anyone else's, and reciprocity builds stronger communities.

Favor Bank also eases some of the anxieties many of us have around asking for favors or feeling over-tapped at times. For instance, have I asked the same friend to help me move multiple times, and have they ever asked me to do anything in return? Or have my mad skills with a screw driver led to a few too many requests lately for home fix-it jobs? Favor Bank's goal is to have many more favors exchanged in your community--and favors that move in every direction.

# Tech
Favor Bank uses a Node.js Express server and a PostgreSQL database to store user information, favor requests, and commitments to do favors. Its front end is built with Materialize.


# To Do
Features we'd like to develop include:

* Using a graphic date-and-time picker to make it easier for a user to indicate when they need a favor done
* Allowing users to enter non-integer time increments
* Adding communication functionality so that users can initiate phone or email contact with their friends from the app's interface
* Building out a web-first interface
* Integrating groups functionality to manage multiple, discrete user communities
