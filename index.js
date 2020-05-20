var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');
//var response= require('response');
//var anything= require('dotenv-extended');
var server = restify.createServer();
var dbcount=0,ccount=0,stcount=0;
var options=['yes','no','exit'];
var exp=['beginner','moderate','advanced'];
var mcq=['a','b','c','d'];
var man=['dolly','tommy','leo'];
var yn=['yes','no'];
var rc=['result','continue'];

server.listen(process.env.port || process.env.PORT || 3978, function () {
console.log('%s listening to %s', server.name, server.url);
});
const connector = new builder.ChatConnector({
    appId: '72260e7e-bdd6-4f5e-8516-517a22343249',
    appPassword: 'SoWXiTHc=yR@H[Bz6ul3h8RmjzDexj.3',
    });

var inMemoryStorage = new builder.MemoryBotStorage();
var bot = new builder.UniversalBot(connector,
    function(session){
    
    //Speech(voice recognition)
    if (hasAudioAttachment(session)) {
            var stream = getAudioStreamFromMessage(session.message);
            speechService.getTextFromAudioStream(stream)
                .then(function (text) {
                    session.send(processText(text));
                })
                .catch(function (error) {
                   // session.send('Oops! Something went wrong. Try again later.');
                    console.error(error);})
        }//if
        else {
            //session.send('Did you upload an audio file? I\'m more of an audible person. Try sending me a wav file');
        }}
    ).set('storage', inMemoryStorage);
//var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/e16b1fef-278b-452a-8140-2a9a4b0cf586?verbose=true&timezoneOffset=0&subscription-key=665d38c5475e43489fb07830318f9c48&q=';
var recognizer = new builder.LuisRecognizer(model);
bot.recognizer(recognizer);

bot.dialog('Greeting', 
function (session,args,next){
    //session.sendTyping();
    session.beginDialog('/media');
    session.send("Once you are done visiting us, Please begin by reading the guidelines to the questionnaire.\n"+"Pay close attention to the highlighted ones");
    session.beginDialog('/guidelines');
}).triggerAction({
    matches: 'Greeting'
});

bot.dialog('/media',
function (session) {
    session.beginDialog('/welcome');
    session.send("You are invited to our profiles at particular social networks");
    var cards = getCardsAttachments();
    // create reply with Carousel AttachmentLayout
    var reply = new builder.Message(session)
        .attachmentLayout(builder.AttachmentLayout.carousel)
        .attachments(cards);
    session.send(reply);
    
//session.beginDialog('/Greeting')
});
bot.dialog('/welcome',
function (session)
{
    session.send("Welcome to High Noon Corp!");
    var welcard = getWelcome();
    var msg = new builder.Message(session).addAttachment(welcard);
    session.send(msg);
});
function getWelcome(session) {
    return new builder.HeroCard(session)
    .title('High Noon Corp')
    .images([
        builder.CardImage.create(session, 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcT1f00qvRiq7iLpaj1tMLf9cHDOjYlnKAz5KBKoQCGFVgWN77vk')
    ]);
}
function getCardsAttachments(session) {
    return [
        new builder.HeroCard(session)
            .title('Facebook')
            .images([
                builder.CardImage.create(session, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUsAAACYCAMAAABatDuZAAAAdVBMVEU7WZkkN109XJz///81VZZwgq84V5d6irMsT5MfR4+zu9IvUZT8/P1sgrElOGA+XqBke61nfq8WITlacaWCkrhEYZ12iLO5wdVMZ6BBXpv29/qlsMvl6fHb4OzCytxfdacSQY2PnL7s7/TN1eSnss2YpcVTbaQESjVJAAACtklEQVR4nO3b3W7aMABA4QCpmzYQAimlo+v6t/L+jzivYYNmQRvR0XClc64sc2N9inESRLasRkZULbNqPjaieZWNxpkRjUdaUmnJpSWXllxacmnJpSWXllxacmnJpSWXllxacmnJpSWXllxacmnJpSWXllxacmnJpSWXllxacmnJpSWXllxacmnJpSWXllxacmnJpSWXllxacmnJpSWXllxacmnJpSWXllxacmnJpSWXllxacmnJpSVX0pYh7yuce1nHStmybC77aspzL+xICVuWN9NJX9ObRDHTtQxNP2XEbNLc5ula5hdHKCeTi/zci+vtE1lu7uOX5e1XLU+va/lwV8RD/OpBy9PrWq7ynzdJWg6pY/mtiFOPdeMeH1DH8rrIynvPnmH9aXnlOT6wHsuplsPqWpZaDu7QcnF7GZ918tvYRsvTO7R8at8O5Xlx43U5oEPLq/D+BB5C+azlgD5Yvs9Ez/xNywF1zp6190TD856IS0suLbm05NKSS0suLbnCanPEcrPyd8gTy7cvB5b7e/WXJs3LMmXLLO+ajfunUylly8+WllxacmnJpSWXllxacmnJpSWXllxacmnJlZxlWRS/3l2E8Pvd2n4YPgz/69L+VmqW5fX1+rnFXNV1vWpnt3HYjsJjXe/+RvElTt6dY43HSs2yeH19/d7+f2c1m81aq9DEYQsYFrNZvbOMk9vzrLK/z2j5qOU/VazX67fdHl/Ui90ejnt80Y4O9/j+8zRKzTIrPHtMSzItubTk0pJLSy4tubTk0pJLSy4tubTk0pJLSy4tubTk0pJLSy4tubTk0pJLSy4tubTk0pJLSy4tubTk0pJLSy4tubTk0pJLSy4tubTk0pJLSy4tubTk0pJLSy4tubTk0pJLSy4tubTk0pJLS65oWc3HRjSvsmU1MqJq+QM9MyPHZEkmzQAAAABJRU5ErkJggg==')
            ]).buttons([
                builder.CardAction.openUrl(session,'https://www.facebook.com/pages/category/Community/High-Noon-Corp-831918296818196/'),    
            ]),
        new builder.HeroCard(session)
            .title('LinkedIn')
            .images([
                builder.CardImage.create(session, 'https://media-exp1.licdn.com/dms/image/C560BAQEycJeX0KQHNg/company-logo_200_200/0?e=2159024400&v=beta&t=oTlZyZkPsh-YSrnHXzT674QrnHKClYz6ZRUYRa8sGV0')
            ]).buttons([
                builder.CardAction.openUrl(session,'https://www.linkedin.com/company/high-noon-corporation'),    
            ]),
        new builder.HeroCard(session)
            .title('Glass Door')
            .images([
                builder.CardImage.create(session, 'https://lh3.googleusercontent.com/Xy7jdbNKeyhYTmlhsDNlauYeuHIKsK0x-DPAb1pwzfIyafyOm7zNLFKR0o9ie9dCGvg')
            ]).buttons([
                builder.CardAction.openUrl(session,'https://www.glassdoor.co.in/Reviews/High-Noon-Corp-Reviews-E601216.htm'),    
            ]),
            ];
}

bot.dialog('None', [ 
    function (session,args,next){
   session.send('Sorry, that is not something I understand');
   session.beginDialog('/Bye');
   }]).triggerAction({
    matches: 'None'
});

bot.dialog('/guidelines',
function (session)
{
    var gcard = getGuidelines();
    var gui = new builder.Message(session).addAttachment(gcard);
    session.send(gui);
    session.beginDialog('/choice');

});

function getGuidelines(session) {
    return new builder.HeroCard(session)
    .title('High Noon Corp')
    .images([
        builder.CardImage.create(session, 'https://pbs.twimg.com/media/EThcSKoUMAEq7-S?format=png&name=small')
    ]);
};

bot.dialog('/choice',[   
    function (session) {
    session.send("You must choose one of the following queries")
    var chcards = getDomainChoice();
  // create reply with Carousel AttachmentLayout
    var ch = new builder.Message(session)
      .attachmentLayout(builder.AttachmentLayout.carousel)
      .attachments(chcards);
    session.send(ch);
    session.send("Remember, while answering, that once ENTER key is pressed, your answer will be considered as submitted\n"+"\nDepending on the domain you choose, questions will be posed.")
}]);

function getDomainChoice(session) {
  return [
      new builder.HeroCard(session)
          .title('Database Administrator')
          .images([
              builder.CardImage.create(session, 'https://insights.dice.com/wp-content/uploads/2018/07/shutterstock_258191603-1.jpg')
          ]),
      new builder.HeroCard(session)
          .title('Software Tester')
          .images([
              builder.CardImage.create(session, 'https://1000houses.com/wp-content/uploads/2017/04/testers.png')
          ]),
      new builder.HeroCard(session)
          .title('Coder')
          .images([
              builder.CardImage.create(session, 'https://blog.mettl.com/hubfs/BLOG%2023%20%28L%29%20%283%29.jpg')
          ]),
      new builder.HeroCard(session)
          .title('General')
          .images([
              builder.CardImage.create(session, 'https://www.wikihow.com/images/thumb/3/38/Make-a-Questionnaire-Step-1-Version-7.jpg/aid1107819-v4-728px-Make-a-Questionnaire-Step-1-Version-7.jpg.webp')
          ])
        ];
}

//Database Administrator Questionnaire
bot.dialog('DBA',
function (session,args,next){
    var clp=session.message.text;
    session.send("You are about to begin Database Administrator domain. Let's Go!");
    session.userData.number=clp;
    session.beginDialog('/dbconfirmation');
},
function(session,results,clp)
{}).triggerAction({
    matches: 'DBA'
}); 

bot.dialog('/dbconfirmation',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,'Do you have a certification *',options);   
        session.message.text=avg;
     },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   //session.send(avg);
    if(sc==='no')
    {   
        session.send("No problem! Lets move on.\n"+"\nQ. Find any 3 hidden words. *\n"+"\n Remember to comma seperate them");
        session.beginDialog('/picturecard');
        //session.beginDialog('AttentionToDetail');
    }
    else if(sc==='yes')
    {
        //session.send("Q. If yes, then what level would you describe it");
        dbcount=dbcount+2;
        session.beginDialog('/Level');
    }
    else
    {
    session.send("I hope we were able to assist you.");
    session.endDialog();
    }
 }
]);

bot.dialog('/Level',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,'Q. If yes, then what level would you describe it*',exp);   
        session.message.text=avg;
     },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='beginner')
    {
        dbcount=dbcount+1;
    }
    else if(sc==='moderate')
    {
        dbcount=dbcount+2;
        //session.beginDialog('/Level');
    }
    else
    {
        dbcount=dbcount+3;
        //session.endDialog();
    }
    console.log(dbcount);
    session.send("Got it! Lets move on.\n"+"\nQ. Find any 3 hidden words. *\n"+"\n Remember to comma seperate them");
    session.beginDialog('/picturecard');
    //session.beginDialog('AttentionToDetail');
 }
 
]);

bot.dialog('/picturecard',
function (session)
{
    var pcard = getATDcard();
    var gui = new builder.Message(session).addAttachment(pcard);
    session.send(gui);
    //session.beginDialog('AttentionToDetail');

});
function getATDcard(session) {
    return new builder.HeroCard(session)
    .images([
        builder.CardImage.create(session, 'https://static.boredpanda.com/blog/wp-content/uploads/2016/01/find-words-challenge-18__700.jpg')
    ]);
}

bot.dialog('AttentionToDetail',
function (session,args,next){
    //session.send("Okay! Response received.");
    var sc=session.message.text;
    console.log(sc.length);
    if(sc.length>=15)
    {
        dbcount=dbcount+3;
    }
    else
    {
        dbcount=dbcount+1;
    }
    console.log(dbcount);
    session.send("Q. Leo, Dolly, and Tommy are related to each other.\n"+"\ni. Among the three are Leo’s legal spouse, Dolly’s sibling, and Tommy’s sister-in-law.\n"+"\nii. Leo’s legal spouse and Dolly’s sibling are of the same sex.");
    session.beginDialog('/ProblemSolving');
    
}).triggerAction({
    matches: 'AttentionToDetail'
});
    
bot.dialog('/ProblemSolving',
[function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,'Who do you know is a married man?',man);   
        session.message.text=avg;
    },
     function(session,results,avg)
    { 
    var sc = session.message.text;
    if(sc==='dolly')
    {
        dbcount=dbcount+1;
    }
    session.send("Q. All except one of the following are important strategies that a manager can use to create a more effective decision-making environment, which one is not? *\n"+"\n * Encourage others to make Decisions\n"+"\n * Be ready to try new things\n"+"\n * Relying solely upon himself/herself\n"+"\n * Recognize the importance of quality information ");
    //session.beginDialog('/choice');
    console.log(dbcount);
}]);

bot.dialog('DecisionMaking',
function (session,args,next){
    //session.send("Okay! Response received.");
    var sc = session.message.text;
    if(sc==='Relying solely upon himself/herself' || sc==='relying solely upon himself/herself')
    {
        dbcount=dbcount+2;
    }
    session.send("Q. Which one is MOST like you when making decisions? *\n"+"\n -> If I have the facts, I want my way when deciding things.\n"+"\n -> I generally agree with others.\n"+"\n -> I agree with decisions but complain when the outcome is not what I expected.\n"+"\n -> I am open to discussing other ideas.\n"+"\n ->I often assume that their ideas will be less successful so I ignore them");
    console.log(dbcount);
}).triggerAction({
    matches: 'DecisionMaking'
});

bot.dialog('AssertiveReasoning',
function (session,args,next){
    //session.send("Okay! Response received.");
    var sc = session.message.text;
    if(sc==='I am open to discussing other ideas' || sc==='i am open to discussing other ideas')
    {
            dbcount=dbcount+2;
    }
    session.send("Q. Mark from the IT sector and Wayne from the accounting sector are supposed to develop a strategy that will accommodate the long-term needs of the company. Mark thinks they need to buy the best computers on the market, while Wayne wants them to pick the cheapest. After an open disagreement, Mark has taken a 2-week leave in order to not have to disagree about the issue again. Which of the following best describes this conflict resolution style? *");
    console.log(dbcount);
    session.beginDialog('/ConflictManagement');
}).triggerAction({
    matches: 'AssertiveReasoning'
});

bot.dialog('/ConflictManagement',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,'a) Avoidance \n'+'\nb) Accommodation \n'+'\nc) Collaboration\n'+'\nd) Conformity',mcq);   
        session.message.text=avg;
    },
     function(session,results,avg)
    { 
    var sc = session.message.text;
    if(sc==='a')
    {
        dbcount=dbcount+2;
    }
    console.log(dbcount);
    session.send("Let's begin the BORING PART! TECHNICAL QUESTIONS \n"+"\n Q1. If we create many non-clustered indexes on a table, what operations are likely to be considerably slower than before? ");
    //session.beginDialog('/DBTech5');
}
]);

bot.dialog('DBTech1',
function (session,args,next){
    //session.send("Okay! Response received.");
    dbcount=dbcount+1;
    session.send("Q2. What types of table or column constraints we have? ");
    console.log(dbcount);
}).triggerAction({
    matches: 'DBTech1'
});

bot.dialog('DBTech2',
function (session,args,next){
    //session.send("Okay! Response received.");
    dbcount=dbcount+1;
    session.send("Q3. What Are System Databases Into Sql Server (2005/2008)? ");
    console.log(dbcount);
}).triggerAction({
    matches: 'DBTech2'
});

bot.dialog('DBTech3',
function (session,args,next){
    //session.send("Okay! Response received.");
    dbcount=dbcount+1;
    session.send("Q4. How one can get distinct records from the table without using distinct keyword? *\n"+"\nChoose the appropriate SQL query");
    console.log(dbcount);
    session.beginDialog('/Sqlcheck');
}).triggerAction({
    matches: 'DBTech3'
});

bot.dialog('/Sqlcheck',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,'a) Select * from Employee a where  rowid = (select max(rowid) from Employee b where  a.Employee_no=b.Employee_no); \n'+'\nb) Select * from Employee a where  rowid = None (select max(rowid) from Employee b where  a.Employee_no=b.Employee_no); \n'+'\nc) Select * from Employee a where  rowid = Any(select max(rowid) from Employee b where  a.Employee_no=b.Employee_no);\n'+'\nd) Select * from Employee a where  rowid = Some(select max(rowid) from Employee b where  a.Employee_no=b.Employee_no);',mcq);   
        session.message.text=avg;
    },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='a')
    {
        dbcount=dbcount+2;
    }
    console.log(dbcount);
    session.send("Q5. Find a query to find duplicate rows in table. *");
    session.beginDialog('/DBTech5');
}
]);

bot.dialog('/DBTech5',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,'a) Select * from Employee a where rowid ==( select max(rowid) from Employee b where a.Employee_num=b.Employee_num); \n'+'\nb) Select * from Employee a where rowid <>( select max(rowid) from Employee b where a.Employee_num=b.Employee_num); \n'+'\nc) Select * from Employee a where rowid !=( select max(rowid) from Employee b where a.Employee_num=b.Employee_num);\n'+'\nd) Select * from Employee a where rowid <>( select min(rowid) from Employee b where a.Employee_num=b.Employee_num);',mcq);   
        session.message.text=avg;
    },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='b')
    {
        dbcount=dbcount+2;
    }
    console.log(dbcount);
    session.send("Q6. Which of the following is the 'Query to fetch last record from the table'? *");
    session.beginDialog('/DBTech6');
}
]);

bot.dialog('/DBTech6',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,'a) Select * from Employee where Rowid= select min(Rowid) from Employee; \n'+'\nb) Select * from Employee where Rowid != select max(Rowid) from Employee; \n'+'\nc) Select * from Employee where Rowid= select avg(Rowid) from Employee;\n'+'\nd) Select * from Employee where Rowid= select max(Rowid) from Employee;',mcq);   
        session.message.text=avg;
    },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='d')
    {
        dbcount=dbcount+2;
    }
    console.log(dbcount);
    session.send("Q7. Can we perform a log backup with COPY ONLY option?");
    session.beginDialog('/DBTech7');
}
]);

bot.dialog('/DBTech7',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,'Please answer in yes or no.',yn);   
        session.message.text=avg;
    },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='yes')
    {
        dbcount=dbcount+1;
    }
    console.log(dbcount);
    session.send("You have reached the end of this domain!")
    session.beginDialog('/DBChoiceResult');
}
]);

bot.dialog('/DBChoiceResult',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,'Do you think you did well and wish to view result or continue to the next domain ',rc);   
        session.message.text=avg;
    },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='continue')
    {
        session.send("Choose between Software Tester and Coder:");
    }
    else
    {
        session.beginDialog('/DBSuccess');
    }
    console.log(dbcount);
}
]);

bot.dialog('/DBSuccess',
function (session)
{
    if(dbcount>=18)
    {
        session.send("You are eligible to become a great DATABASE ADMINISTRATOR");
    }
    else
    {
        session.send("Just a bit more and you will make a great DBA")
    }
    var dbcard = getDBcard();
    var db = new builder.Message(session).addAttachment(dbcard);
    session.send(db);
    //session.beginDialog('AttentionToDetail');
    //session.send("It was nice interacting with you. Hopefully we were of some help!");
});
function getDBcard(session) {
    return new builder.HeroCard(session)
    .images([
        builder.CardImage.create(session, 'https://www.careertoolkit.com/wp-content/uploads/2016/11/database-admin-500.jpg')
    ]);
}

//Software Tester Questionnaire
bot.dialog('ST',
function (session,args,next){
    var clp=session.message.text;
    session.send("You have begun Software Tester domain. Let's begin!");
    session.userData.number=clp;
    session.beginDialog('/stconfirmation');
},
function(session,results,clp)
{}).triggerAction({
    matches: 'ST'
}); 
bot.dialog('/stconfirmation',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,'Do you have a certification *',options);   
        session.message.text=avg;
     },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   //session.send(avg);
    if(sc==='no')
    {
        session.send("No problem! Lets move on.\n"+"\n Q. The priorities, when large number of controls and displays are to be arranged, are: \n"+"\n a) First priority: Primary visual task \n"+"\n b) Second priority: Primary controls (interacting with primary visual task) \n"+"\n c) Third priority:  Better controls-display relationships \n"+"\n d) Fourth priority: Location of frequently used items with easy use");
        session.beginDialog('/Prioritizing');
    }
    else if(sc==='yes')
    {
        stcount=stcount+2;
        session.beginDialog('/STLevel');
    }
    else
    {
    session.send("I hope we were able to assist you.");
    session.endDialog();
    }
 }
]);

bot.dialog('/STLevel',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,'Q. If yes, then what level would you describe it*',exp);   
        session.message.text=avg;
     },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='beginner')
    {
        stcount=stcount+1;
    }
    else if(sc==='moderate')
    {
        stcount=stcount+2;
        //session.beginDialog('/Level');
    }
    else
    {
        stcount=stcount+3;
        //session.endDialog();
    }
    console.log(stcount);
    session.send("No problem! Lets move on.\n"+"\n Q. The priorities, when large number of controls and displays are to be arranged, are: \n"+"\n a) First priority: Primary visual task \n"+"\n b) Second priority: Primary controls (interacting with primary visual task) \n"+"\n c) Third priority:  Better controls-display relationships \n"+"\n d) Fourth priority: Location of frequently used items with easy use");
    session.beginDialog('/Prioritizing');
 }
]);

bot.dialog('/Prioritizing',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,'Which of the above is not correctly matched?',mcq);   
        session.message.text=avg;
    },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='d')
    {
        stcount=stcount+1;
    }
    console.log(stcount);
    session.send("Q. A man drove from Cambridge to Toronto. Shortly after passing through Easter he stopped for coffee at Brighton which was the halfway point on his journey. ");
    session.beginDialog('/DataAnalyzer');
}
]);

bot.dialog('/DataAnalyzer',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,'Which is the longest distance? \n'+'\n a) Cambridge to Easter \n'+'\n b) Easter to Toronto \n'+'\n c) Brighton to Toronto \n'+'\n d) Easter to Brighton',mcq);   
        session.message.text=avg;
    },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='b')
    {
        stcount=stcount+2;
    }
    console.log(stcount);
    session.send("Q. When something happens that I don't like or appreciate, I can tend to conclude that the cause is widespread in nature and will continue to plague me.\n"+"\nFor example, 'My assistant didn't 'cc' me on that email she sent to my boss. Administrative assistants are all out to prove how much smarter they are than their supervisors.'");
    session.beginDialog('/PositiveAttitude');
}
]);

bot.dialog('/PositiveAttitude',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,'a) Not at all \n'+'\n b) Rarely \n'+'\n c) Sometimes \n'+'\n d) Often',mcq);   
        session.message.text=avg;
    },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='b')
    {
        stcount=stcount+2;
    }
    else
    {
        stcount=stcount+1;
    }
    console.log(stcount);
    session.send("Q. When I make a decision that proves to be successful, it's because I have expertise on the subject and analyzed that particular problem really well, as opposed to being generally a strong decision maker. ");
    session.beginDialog('/PositiveAttitude1');
}
]);

bot.dialog('/PositiveAttitude1',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,'a) Sometimes \n'+'\n b) Rarely \n'+'\n c) Often \n'+'\n d) Very Often',mcq);   
        session.message.text=avg;
    },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='d')
    {
        stcount=stcount+2;
    }
    else
    {
        stcount=stcount+1;
    }
    console.log(stcount);
    session.send("Q. What are the words you see more often in the following picture?");
    session.beginDialog('/SNBpicture');
}
]);

bot.dialog('/SNBpicture',
function (session)
{
    var scard = getSNBcard();
    var pic = new builder.Message(session).addAttachment(scard);
    session.send(pic);
    //session.beginDialog('AttentionToDetail');

});
function getSNBcard(session) {
    return new builder.HeroCard(session)
    .images([
        builder.CardImage.create(session, 'http://1pv2qf2te2gm20k28u30ivdc-wpengine.netdna-ssl.com/wp-content/uploads/2010/08/TeaserTable-300x252.jpg')
    ]);
}

bot.dialog('MultitaskingAbilities',
function (session,args,next){
    stcount=stcount+1;
    session.send("Q4. Which word appears the most number of times?");
    console.log(stcount);
    session.beginDialog('/Howmany');       
}).triggerAction({
    matches: 'MultitaskingAbilities'
});

bot.dialog('/Howmany',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.text(session,'How many times does it occur? Remember to comma separate them!');   
        session.message.text=avg;
    },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='sun,12')
    {
        stcount=stcount+2;
    }
    console.log(stcount);
    session.send("Q. Your manager has just asked every member of the team to independently study and submit a detailed plan for implementing a total Employee Involvement/Quality program in their area of responsibility. In subsequent conversations with other team members,___");
    session.beginDialog("/TeamPlayer");
}
]);

bot.dialog('/TeamPlayer',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,' a) The manager is not to be trusted; there is a hidden agenda behind all of this.\n'+'\n b) Cooperating fully with the manager’s request is easy because you can count on him/her to keep the best interests, both of the individual and team, in mind. \n'+'\n c) Team members are suspicious but are reluctantly cooperating with the manager’s request. \n'+'\n d) You have to deal with this manager on a case by case basis, wait and see is the best policy.',mcq);   
        session.message.text=avg;
    },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='b')
    {
        stcount=stcount+2;
        //ccount=ccount+2;
    }
    console.log(stcount);
    //console.log(ccount);
    session.send("Q. State whether each statement is True or False.\n"+"\nRemember to comma seperate them like 'true,true,true' or answer in batches like 'ttt' or 'fff' ");
    session.send(" -> The best policy is to ask for identify of the person or the other end first before announcing your identity.\n"+"\n -> Never leave a caller or hold.\n"+"\n -> Use simple language, avoid slang technical ferns.");
}
]);

bot.dialog('CommunicationSkills',
function (session,args,next){
    var sc=session.message.text;
    if((sc==='false,true,true') || (sc==='ftt'))
    {
        stcount=stcount+2;
    }
    session.send("BORING PART ALERT! TECHNICAL SECTON...\n"+"\n Q1. What are the four different test levels?");
    console.log(stcount);
}).triggerAction({
    matches: 'CommunicationSkills'
});

bot.dialog('STTech1',
function (session,args,next){
    var sc=session.message.text;
    if(sc.length>=30)
    {
        stcount=stcount+2;
    }
    else
    {
        stcount=stcount+1;
    }
    session.send("Q2. What are the three types of defects? ");
    console.log(stcount);
}).triggerAction({
    matches: 'STTech1'
});

bot.dialog('STTech2',
function (session,args,next){
    stcount=stcount+1;
    session.send("Q3. What type of testing is Cyclomatic complexity?\n"+"\n -> Black box testing\n"+"\n -> White box testing\n"+"\n -> Yellow box testing\n"+"\n ->	Green box testing");
    console.log(stcount);
}).triggerAction({
    matches: 'STTech2'
});

bot.dialog('STTech3',
function (session,args,next){
    var sc=session.message.text;
    if(sc==='White box testing' || sc==='white box testing' || sc==='white box')
    {
        stcount=stcount+1;
    }
    session.send("Q4. Which testing is an integration testing approach that is commonly used when “shrink-wrapped” software products are being developed?\n"+"\n -> Smoke testing\n"+"\n ->	Integration testing\n"+"\n -> Regression testing\n"+"\n -> Validation testing");
    console.log(stcount);
}).triggerAction({
    matches: 'STTech3'
});

bot.dialog('STTech4',
function (session,args,next){
    var sc=session.message.text;
    if(sc==='Smoke testing' || sc==='Smoke Testing' || sc==='smoke')
    {
        stcount=stcount+2;
    }
    session.send("Q5. What is a role of Test Manager?\n");
    session.beginDialog('/STTech5');
    console.log(stcount);
}).triggerAction({
    matches: 'STTech4'
});

bot.dialog('/STTech5',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,' a)	Determine when to release a system\n'+'\n b) Reallocate resources to meet objectives\n'+'\n c) Report deviations in project plan\n'+'\n d) Raise incidents on fault',mcq);   
        session.message.text=avg;
    },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='b')
    {
        stcount=stcount+1;
    }
    console.log(stcount);
    session.send("Q6. Maintenance testing is performed using which methodology?");
    session.beginDialog('/STTech6');
}
]);

bot.dialog('/STTech6',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,' a)	Retesting\n'+'\n b) Sanity Testing\n'+'\n c) Breadth test and depth test \n'+'\n d) Confirmation Testing',mcq);   
        session.message.text=avg;
    },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='c')
    {
        stcount=stcount+2;
    }
    session.send("Q7. SPICE stands for ___")
}
]);

bot.dialog('STTech7',
function (session,args,next){
    var sc=session.message.text;
    if(sc==='Software Process Improvement and Control Determination' || sc==='software process improvement and control determination')
    {
        stcount=stcount+1;
    }
    console.log(stcount);
    session.send("You have reached the end of this domain!");
    session.beginDialog('/STChoiceResult');
}).triggerAction({
    matches: 'STTech7'
});

bot.dialog('/STChoiceResult',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,'Do you think you did well and wish to view result or continue to the next domain ',rc);   
        session.message.text=avg;
    },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='continue')
    {
        session.send("Choose between Database Administrator and Coder:");
    }
    else
    {
        session.beginDialog('/STSuccess');
    }
    console.log(dbcount);
}
]);

bot.dialog('/STSuccess',
function (session)
{
    if(stcount>=21)
    {
        session.send("You are eligible to become a great SOFTWARE TESTER");
    }
    
    var stcard = getSTcard();
    var st = new builder.Message(session).addAttachment(stcard);
    session.send(st);
    session.send("It was nice interacting with you. Hopefully we were of some help!");
    //session.beginDialog('AttentionToDetail');

});
function getSTcard(session) {
    return new builder.HeroCard(session)
    .images([
        builder.CardImage.create(session, 'https://i.ytimg.com/vi/Hj853idz5yE/maxresdefault.jpg')
    ]);
}

//CODING QUESTIONNAIRE
bot.dialog('CODER',
function (session,args,next){
    var clp=session.message.text;
    session.send("You have chosen Coder domain. Let's begin!");
    session.userData.number=clp;
    session.beginDialog('/cdconfirmation');
},
function(session,results,clp)
{}).triggerAction({
    matches: 'CODER'
}); 

bot.dialog('/cdconfirmation',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,'Do you have a certification *',options);   
        session.message.text=avg;
     },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   //session.send(avg);
    if(sc==='no')
    { 
        session.send("Not an issue! Lets continue..\n"+"\nQ. A team of 5 players Ashwin, Rahul, Sachin, Virat and Rohit participated in a tournament and played four matches. The following table gives partial information about their individual scores and the total runs scored by the team in each match. Each column has two values missing. These are the runs scored by the two lowest scorers in that match. None of the two missing values is more than 10% of the total runs scored in that match.");
        session.beginDialog('/tablecard');
        session.send("What is the maximum possible percentage contribution of Ashwin in the total runs scored in the four matches? ");
        session.beginDialog("/LogicalSkills");
    }
    else if(sc==='yes')
    {
        ccount=ccount+2;
        session.beginDialog('/CDLevel');
    }
    else
    {
    session.send("I hope we were able to assist you.");
    session.endDialog();
    }
 }
]);

bot.dialog('/CDLevel',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,'Q. If yes, then what level would you describe it*',exp);   
        session.message.text=avg;
     },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='beginner')
    {
        ccount=ccount+1;
    }
    else if(sc==='moderate')
    {
        ccount=ccount+2;
        //session.beginDialog('/Level');
    }
    else
    {
        ccount=ccount+3;
        //session.endDialog();
    }
    console.log(ccount);
    session.send("Q. A team of 5 players Ashwin, Rahul, Sachin, Virat and Rohit participated in a tournament and played four matches. The following table gives partial information about their individual scores and the total runs scored by the team in each match. Each column has two values missing. These are the runs scored by the two lowest scorers in that match. None of the two missing values is more than 10% of the total runs scored in that match.");
    session.beginDialog('/tablecard');
    session.send("What is the maximum possible percentage contribution of Ashwin in the total runs scored in the four matches? ");
    //session.beginDialog("/LogicalSkills");
}
]);

bot.dialog('/tablecard',
function (session)
{
    var tcard = getTableCard();
    var ttpic = new builder.Message(session).addAttachment(tcard);
    session.send(ttpic);
    //session.beginDialog('AttentionToDetail');

});
function getTableCard(session) {
    return new builder.HeroCard(session)
    .images([
        builder.CardImage.create(session, 'https://pbs.twimg.com/media/EUv-MwfUUAARvlA?format=png&name=small')
    ]);
}

bot.dialog('LogicalSkills',

     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='19.7%' || sc==='19.7')
    {
        ccount=ccount+2;
    }
    console.log(ccount);
    //console.log(ccount);
    session.send("Q. Describe the level of communication between team members: ");
    session.beginDialog('/TeamPlayerCoder');
}).triggerAction({
    matches: 'LogicalSkills'
});

bot.dialog('/TeamPlayerCoder',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,' a) In this team, people are afraid to speak up and we do not listen to each other.\n'+'\n b) Everybody speaks up, but not all team members listen.\n'+'\n c) Everybody accurately states their view and others listen and understand what is being said-we talk together. \n'+'\n d) Quite a few of the team members withhold their thoughts and don’t listen to others',mcq);   
        session.message.text=avg;
    },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='c')
    {
        ccount=ccount+1;
    }
    console.log(ccount);
    //console.log(ccount);
    session.send("Q. You're in the middle of an important job when your manager stops and interrupts you. What do you do? ");
    session.beginDialog('/Priority');
}
]);

bot.dialog('/Priority',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,' a) You dont want to fall behind so you continue your work but try to listen to what the other person is saying at the same time. \n'+'\n b) You find out what they want and how urgent it is, and decide whether to deal with it now or leave it for later.\n'+'\n c) You politely let them know that you are busy and they should come back later. \n'+'\n d) You stop working and talk because manager must be given utmost importance.',mcq);   
        session.message.text=avg;
    },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='b')
    {
        ccount=ccount+2;
    }
    console.log(ccount);
    //console.log(ccount);
    session.send("Q. Four cups are placed upturned on the counter. Each cup has the same number of sweets and a declaration about the number of sweets in it. The declarations are: Five or Six, Seven or Eight, Six or Seven, Seven or Five. Only one of the declarations is correct.");
    session.beginDialog('/PS');
}
]);

bot.dialog('/PS',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.text(session,'How many sweets are there under each cup?');   
        session.message.text=avg;
    },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='8' || sc==='eight')
    {
        ccount=ccount+1;
    }
    console.log(ccount);
    //console.log(ccount);
    session.beginDialog('/cardCT');
    session.beginDialog('/CreativeThinking');
}
]);

bot.dialog('/cardCT',
function (session)
{
    var ctcard = getCTCard();
    var tpic = new builder.Message(session).addAttachment(ctcard);
    session.send(tpic);
    //session.beginDialog('AttentionToDetail');

});
function getCTCard(session) {
    return new builder.HeroCard(session)
    .images([
        builder.CardImage.create(session, 'https://pbs.twimg.com/media/EX9rgA-UMAUv3Ov?format=png&name=small')
    ]);
}

bot.dialog('/CreativeThinking',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.text(session,'Scratch your creative head! *');   
        session.message.text=avg;
    },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='87')
    {
        ccount=ccount+3;
    }
    console.log(ccount);
    //console.log(ccount);
    session.send("Just turn the picture upside-down in your head!!!")
    session.send("Q. A duck, a goose, a goat, and a horse all entered the barn at different times one day last week. *\n"+"\n a) A mammal entered the barn first.*\n"+"\n b)The duck entered before the goose.*\n"+"\n c) The goose entered ahead of the horse.*\n"+"\nWho entered the barn first?");
}
]);

bot.dialog('QuickThinking',
function (session,args,next){
    var sc=session.message.text;
    if(sc==='goat' || sc==='the goat' || sc==='Goat')
    {
        ccount=ccount+2;
    }
    session.send("Q. When speaking on the phone, you need to ensure you do not do what?");
    session.beginDialog('/PeopleSkills');
    console.log(stcount);
}).triggerAction({
    matches: 'QuickThinking'
});

bot.dialog('/PeopleSkills',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,' a) Speak any language other than English. \n'+'\n b) Hang up on someone.\n'+'\n c) Breach confidentiality.\n'+'\n d) Break communication law.',mcq);   
        session.message.text=avg;
    },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='c')
    {
        ccount=ccount+1;
    }
    console.log(ccount);
    //console.log(ccount);
    session.send("Q. When waiting for important results,____ *");
    session.beginDialog('/Patience');
}
]);

bot.dialog('/Patience',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,' a) You wait until you are notified your results are ready. \n'+'\n b) You check constantly, and curse out the phone/computer/mail man.\n'+'\n c) You check often and get anxious the longer you have to wait.\n'+'\n d) You let friends find their results first, and wait for them to notify you.',mcq);   
        session.message.text=avg;
    },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='a')
    {
        ccount=ccount+2;
    }
    console.log(ccount);
    session.send("BORING PART ALERT! TECHNICAL SECTION.\n"+"\nThe company requires recruit who are good at JAVA");
    session.send("Q1. All classes in Java are inherited from which class? ");
}
]);

bot.dialog('CTech1',
function (session,args,next){
    var sc=session.message.text;
    if(sc==='java.lang.Object' || sc==='java.lang.object')
    {
        ccount=ccount+1;
    }
    session.send("Q2. What would be the result if a class extends two interfaces and both have a method with same name and signature? Let’s assume that the class is not implementing that method.");
    console.log(ccount);
}).triggerAction({
    matches: 'CTech1'
});

bot.dialog('CTech2',
function (session,args,next){
    var sc=session.message.text;
    if(sc==='Compile time error' || sc==='Compiler error' || sc==='compiler error')
    {
        ccount=ccount+1;
    }
    session.send("Q3. Which one of the following class definitions is a valid definition of a class that cannot be instantiated?");
    console.log(ccount);
    session.beginDialog('/CTech3')
}).triggerAction({
    matches: 'CTech2'
});

bot.dialog('/CTech3',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,' a) class Ghost \n \t abstract void haunt();\n'+'\n b) abstract class Ghost \n \t void haunt();\n'+'\n c) abstract class Ghost \n \t void haunt() { };\n'+'\n d) static class Ghost \n \t abstract haunt();',mcq);   
        session.message.text=avg;
    },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='c')
    {
        ccount=ccount+1;
    }
    console.log(ccount);
    //console.log(ccount);
    session.send("Q4. Given the following class, which of these is valid way of referring to the class from outside of the package net.basemaster? *");
    session.send("\t package net.basemaster;\n"+"\n \t public class Base {\n"+"\n \t // . . .\n"+"\n \t }");
    session.beginDialog('/CTech4');
}
]);

bot.dialog('/CTech4',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,' a) By simply referring to the class as basemaster.Base\n'+'\n b) By simply referring to the class as net.basemaster.Base\n'+'\n c) By simply referring to the class as net.Base\n'+'\n d) By importing with net.* and referring to the class as basemaster.Base',mcq);   
        session.message.text=avg;
    },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='b')
    {
        ccount=ccount+2;
    }
    console.log(ccount);
    //console.log(ccount);
    session.send("Q5. How can you generate random numbers in Java? *");
}
]);

bot.dialog('CTech5',
function (session,args,next){
    ccount=ccount+2;
    console.log(ccount);
    session.send("Q6. Which of the following is true in regard to applet execution?");
    session.beginDialog('/CTech6')
}).triggerAction({
    matches: 'CTech5'
});

bot.dialog('/CTech6',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,' a) Applets loaded from the same computer where they are executing have the same restrictions as applets loaded from the network.\n'+'\n b) Applets loaded and executing locally have some restrictions faced by applets that get loaded from the network.\n'+'\n c) Applets can be run independently.\n'+'\n d) Applets loaded and executing locally have none of the restrictions faced by applets that get loaded from the network.',mcq);   
        session.message.text=avg;
    },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='d')
    {
        ccount=ccount+2;
    }
    console.log(ccount);
    session.send("Q7. How restrictive is the default accessibility compared to public, protected, and private accessibility? *");
    session.beginDialog('/CTech7');
}
]);

bot.dialog('/CTech7',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,' a) Less restrictive than public, More restrictive than private.\n'+'\n b) More restrictive than public, but less restrictive than protected.\n'+'\n c) More restrictive than protected, but less restrictive than private.\n'+'\n d) Less restrictive than protected from within a package, and more restrictive than protected from outside a package.',mcq);   
        session.message.text=avg;
    },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='c')
    {
        ccount=ccount+2;
    }
    console.log(ccount);
    session.send("Q8. What will be the output of the following Java code? *");
    session.beginDialog('/codecard');
    
}
]);

bot.dialog('/codecard',
function (session)
{
    var codecard = getCodeCard();
    var codepic = new builder.Message(session).addAttachment(codecard);
    session.send(codepic);
    
});
function getCodeCard(session) {
    return new builder.HeroCard(session)
    .images([
        builder.CardImage.create(session, 'https://pbs.twimg.com/media/EU12c4_UEAETqIp?format=png&name=small')
    ]);
};

bot.dialog('Ctech8',
function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='abc')
    {
        ccount=ccount+2;
    }
    //console.log(ccount);
    session.send("Q9. What will be the output of the following Java code? *");
    session.beginDialog('/codecardl');
    
}).triggerAction({
    matches: 'Ctech8'
});

bot.dialog('/codecardl',
function (session)
{
    var codecardl = getCodeCardL();
    var codepic1 = new builder.Message(session).addAttachment(codecardl);
    session.send(codepic1);
    //session.beginDialog('AttentionToDetail');

});
function getCodeCardL(session) {
    return new builder.HeroCard(session)
    .images([
        builder.CardImage.create(session, 'https://pbs.twimg.com/media/EU14TPlUcAArfjg?format=png&name=small')
    ]);
};

bot.dialog('Ctech9',
    function (session,args,next){
    var sc=session.message.text;
    if(sc==='node1' || sc==='Node1')
    {
        ccount=ccount+2;
    }
    console.log(ccount);
    session.beginDialog('/CTChoiceResult');
}).triggerAction({
    matches: 'Ctech9'
});

bot.dialog('/CTChoiceResult',
[  function(session,clp)
    { 
        avg=clp;
        builder.Prompts.choice(session,'Do you think you did well and wish to view result or continue to the next domain ',rc);   
        session.message.text=avg;
    },
     function(session,results,avg)
    { 
    var sc = session.message.text;
   
    if(sc==='continue')
    {
        session.send("Choose between Database Administrator and Software Tester:");
    }
    else
    {
        session.beginDialog('/CDSuccess');
    }
    console.log(dbcount);
}
]);

bot.dialog('/CDSuccess',
function (session)
{   if(dbcount>stcount && dbcount>ccount)
    {
        if(dbcount>=18)
        {
        session.beginDialog('/DBSuccess');
        }
    }
    else if(stcount>dbcount && stcount>ccount)
    {
        if(stcount>=21)
        {
            session.beginDialog('/STSuccess');
        }
    }
    else if(ccount>dbcount && ccount>stcount)
    {
        if(ccount>=23)
        {
        session.send("You are on your way to become a great CODER");
        var cdcard = getCDcard();
        var cd = new builder.Message(session).addAttachment(cdcard);
        session.send(cd);
        }
    }
    
    //session.beginDialog('AttentionToDetail');
    session.send("It was nice interacting with you. Hopefully we were of some help!");

});
function getCDcard(session) {
    return new builder.HeroCard(session)
    .images([
        builder.CardImage.create(session, 'https://coder.com/og-image.png')
    ]);
};

bot.dialog('General', 
function (session,arg){
    session.send("Choose which domain you want to tackle first...\n"+"\n * Database administrator\n"+"\n * Software Tester\n"+"\n * Coder");
}).triggerAction({
    matches: 'General'
});

bot.dialog('Bye', function (session,arg){
    //session.sendTyping();
    session.send("Glad to be of help.");
session.endDialog();
}).triggerAction({
    matches: 'Bye'
});

// Spell Check
if (process.env.IS_SPELL_CORRECTION_ENABLED === 'true') {
    bot.use({
        botbuilder: function (session, next) {
            spellService
                .getCorrectedText(session.message.text)
                .then(function (text) {
                    session.message.text = text;
                    next();
                })
                .catch(function (error) {
                    console.error(error);
                    next();
                });
        }
    });
}
//require('dotenv-extended').load();

//var builder = require('botbuilder'),
    fs = require('fs'),
    needle = require('needle'),
   // restify = require('restify'),
   // request = require('request'),
    url = require('url'),
    speechService = require('./speech_Service.js');

//=========================================================
function hasAudioAttachment(session) {
    return session.message.attachments.length > 0 &&
        (session.message.attachments[0].contentType === 'audio/wav' ||
            session.message.attachments[0].contentType === 'application/octet-stream');
}

function getAudioStreamFromMessage(message) {
    var headers = {};
    var attachment = message.attachments[0];
    if (checkRequiresToken(message)) {
        // The Skype attachment URLs are secured by JwtToken,
        // you should set the JwtToken of your bot as the authorization header for the GET request your bot initiates to fetch the image.
        // https://github.com/Microsoft/BotBuilder/issues/662
        connector.getAccessToken(function (error, token) {
            var tok = token;
            headers['Authorization'] = 'Bearer ' + token;
            headers['Content-Type'] = 'application/octet-stream';

            return needle.get(attachment.contentUrl, { headers: headers });
        });
    }

    headers['Content-Type'] = attachment.contentType;
    return needle.get(attachment.contentUrl, { headers: headers });
}

function checkRequiresToken(message) {
    return message.source === 'skype' || message.source === 'msteams';
}

function processText(text) {
    var result = 'You said: ' + text + '.';

    if (text && text.length > 0) {
        var wordCount = text.split(' ').filter(function (x) { return x; }).length;
        result += '\n\nWord Count: ' + wordCount;

        var characterCount = text.replace(/ /g, '').length;
        result += '\n\nCharacter Count: ' + characterCount;

        var spaceCount = text.split(' ').length - 1;
        result += '\n\nSpace Count: ' + spaceCount;

        var m = text.match(/[aeiou]/gi);
        var vowelCount = m === null ? 0 : m.length;
        result += '\n\nVowel Count: ' + vowelCount;
    }

    return result;
}

//=========================================================
// Bots Events
//=========================================================

// Sends greeting message when the bot is first added to a conversation
bot.on('conversationUpdate', function (message) {
    if (message.membersAdded) {
        message.membersAdded.forEach(function (identity) {
            if (identity.id === message.address.bot.id) {
                var reply = new builder.Message()
                    .address(message.address)
                    //.text('Hi! I am SpeechToText Bot. I can understand the content of any audio and convert it to text. Try sending me a wav file.');
                bot.send(reply);
            }
        });
    }
});
