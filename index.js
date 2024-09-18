const Alexa = require('ask-sdk-core');

const SKILL_NAME = "inx ocean";
const GET_FACT_MESSAGE = "Here's a tongue twister for you...";

const CONTINUE_REPROMPT = "Would you like another tongue twister or would you like me to repeat the last one?";
const REPEAT_MESSAGE = "Sure, here it is... ";

const CANT_REPEAT_PROMPT = "There is nothing to repeat. Do you want to hear a new tongue twister?";
const CANT_REPEAT_REPROMPT = "Do you want to hear a new tongue twister?";

const HELP_REPROMPT = "Do you want to hear a tongue twister?";
const HELP_MESSAGE = "Welcome to inx ocean. You can say, ask fun liners for a tongue twister or you can say, give me a tongue twister from fun liners!";

const FALLBACK_REPROMPT = "Do you want to hear a tongue twister?";
const FALLBACK_MESSAGE = "The inx ocean skill can't help you with that. It can tell you different tongue twisters. Simply say, ask fun liners for a tongue twister!";

const STOP_MESSAGE = "Thank you for using inx ocean! I look forward to seeing you again soon!";
const ERROR_MESSAGE = "Sorry, an error occurred. Please try again after some time."

const DATA = [
    "Tiny tiger tied her tie tighter to tidy her tiny tail.",
    "She sells sea shells at the sea shore.",
    "How much pot, could a pot roast roast, if a pot roast could roast pot.",
    "Which wristwatches are Swiss wristwatches?",
    "How much wood would a woodchuck chuck, if a woodchuck could chuck wood?",
    "Tiny tiger tied her tie tighter to tidy her tiny tail.",
    "She sells sea shells at the sea shore.",
    "How much pot, could a pot roast roast, if a pot roast could roast pot.",
    "Which wristwatches are Swiss wristwatches?",
    "How much wood would a woodchuck chuck, if a woodchuck could chuck wood?",
    "Tiny tiger tied her tie tighter to tidy her tiny tail.",
    "She sells sea shells at the sea shore.",
    "How much pot, could a pot roast roast, if a pot roast could roast pot.",
    "Which wristwatches are Swiss wristwatches?",
    "How much wood would a woodchuck chuck, if a woodchuck could chuck wood?"
];

const HelpHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
        && request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
        .speak(HELP_MESSAGE + HELP_REPROMPT)
        .reprompt(HELP_REPROMPT)
        .getResponse();
    }
};

const FallbackHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
        && request.intent.name === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
        .speak(FALLBACK_MESSAGE + FALLBACK_REPROMPT)
        .reprompt(FALLBACK_REPROMPT)
        .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
        && (request.intent.name === 'AMAZON.CancelIntent'
            || request.intent.name === 'AMAZON.StopIntent'
            || request.intent.name === 'AMAZON.NoIntent');
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
        .speak(STOP_MESSAGE)
        .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);

        return handlerInput.responseBuilder
        .speak(ERROR_MESSAGE)
        .getResponse();
    }
};

// Add Custom Handler Definitions
const GetNewFactHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' || (request.type === 'IntentRequest'
    && (request.intent.name === 'AMAZON.HelpIntent' || request.intent.name === 'GetNewFactIntent' || request.intent.name === 'AnotherFactIntent' || request.intent.name === 'AMAZON.YesIntent'));
  },
  async handle(handlerInput) {
    const randomFact = await getTongueTwister();
    const attributesManager = handlerInput.attributesManager;
    let sessionAttributes = attributesManager.getSessionAttributes();
    sessionAttributes.lastSpeech = randomFact;
    attributesManager.setSessionAttributes(sessionAttributes);
    const speechOutput = GET_FACT_MESSAGE + randomFact + CONTINUE_REPROMPT;
    return handlerInput.responseBuilder
    .speak(speechOutput)
    .withSimpleCard(SKILL_NAME, randomFact)
    .reprompt(HELP_REPROMPT)
    .getResponse();
  }
};

const RepeatHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.RepeatIntent';
  },
  async handle(handlerInput) {
    const randomFact = await getTongueTwister();
    const attributesManager = handlerInput.attributesManager;
    let randomFact = sessionAttributes.lastSpeech;
    if(randomFact){
      return handlerInput.responseBuilder
      .speak(REPEAT_MESSAGE + randomFact + CONTINUE_REPROMPT)
      .reprompt(CONTINUE_REPROMPT)
      .getResponse()
    }else{
      return handlerInput.responseBuilder
      .speak(CANT_REPEAT_PROMPT)
      .reprompt(CANT_REPEAT_PROMPT)
      .getResponse()
    }
  }
};

const getTongueTwister = async () => {
  let length = DATA.length;
  const selectedIndex = Match.floor(Match.random() * length);
  let result = DATA[selectedIndex];
  return result;
}

let skill;

exports.handler = async (event, context) => {
    console.log("REQUEST", JSON.stringify(event));
    if (!skill) {
        skill = Alexa.SkillBuilders.custom()
        .addRequestHandlers(
            GetNewFactHandler,
            RepeatHandler,
            HelpHandler,
            FallbackHandler,
            CancelAndStopIntentHandler,
            SessionEndedRequestHandler
        )
        .addErrorHandlers(ErrorHandler)
        .create();
    }

    const response = await skill.invoke(event, context);
    console.log("RESPONSE", JSON.stringify(response));
    return response;
};
