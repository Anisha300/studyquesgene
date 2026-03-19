const coreQuestions = {
  'multiple choice': [
    {
      prompt: 'Which element is generally essential for a valid contract to be formed?',
      options: ['Moral obligation only', 'Offer, acceptance, and consideration', 'Registration in every case', 'Performance before agreement'],
      correctAnswer: 'Offer, acceptance, and consideration',
      explanation: 'A valid contract usually requires an offer, acceptance, lawful consideration, capacity, and a lawful object. Registration is not mandatory for every contract.'
    },
    {
      prompt: 'What is the usual effect of consent obtained by coercion?',
      options: ['The agreement is automatically criminal only', 'The agreement becomes voidable at the option of the aggrieved party', 'The agreement is always valid if signed', 'The agreement converts into a tort claim only'],
      correctAnswer: 'The agreement becomes voidable at the option of the aggrieved party',
      explanation: 'Where consent is not free because of coercion, the law generally allows the affected party to avoid the contract.'
    },
    {
      prompt: 'Which remedy most commonly follows breach of contract?',
      options: ['Damages', 'Probation', 'Exile', 'Preventive detention'],
      correctAnswer: 'Damages',
      explanation: 'Damages are the ordinary contractual remedy and are aimed at compensating the loss caused by non-performance.'
    },
    {
      prompt: 'An invitation to treat is best understood as:',
      options: ['A final promise that immediately binds both parties', 'A preliminary communication inviting offers', 'A judicial decree', 'A completed novation'],
      correctAnswer: 'A preliminary communication inviting offers',
      explanation: 'Displays and advertisements often invite others to make offers rather than constituting offers themselves.'
    },
    {
      prompt: 'Why is consideration important in contract law?',
      options: ['It proves every contract must be registered', 'It shows that each side gives something of legal value', 'It eliminates the need for consent', 'It replaces intention to create legal relations'],
      correctAnswer: 'It shows that each side gives something of legal value',
      explanation: 'Consideration represents the bargain element of an agreement by showing reciprocal exchange of value.'
    }
  ],
  'short answer': [
    {
      prompt: 'Explain the difference between a void contract and a voidable contract.',
      correctAnswer: 'A void contract has no legal effect from the outset, while a voidable contract remains valid unless and until the aggrieved party rescinds it.',
      explanation: 'The distinction matters because a voidable contract can still produce legal consequences before avoidance, unlike a void agreement.'
    },
    {
      prompt: 'What is anticipatory breach?',
      correctAnswer: 'Anticipatory breach occurs when one party clearly indicates before performance is due that they will not perform their contractual obligations.',
      explanation: 'The innocent party may often accept the repudiation immediately and claim damages rather than waiting for the due date.'
    },
    {
      prompt: 'Why is free consent important in contract formation?',
      correctAnswer: 'Free consent ensures that parties voluntarily agree to the same thing in the same sense without coercion, undue influence, fraud, misrepresentation, or mistake.',
      explanation: 'Without genuine consent, the law may refuse enforcement or allow the affected party to avoid the transaction.'
    },
    {
      prompt: 'Define quasi-contract.',
      correctAnswer: 'A quasi-contract is a legal obligation imposed by law to prevent unjust enrichment even though no actual contract exists between the parties.',
      explanation: 'It is restitutionary in nature and focuses on fairness where one party has benefited at another’s expense.'
    },
    {
      prompt: 'What is specific performance?',
      correctAnswer: 'Specific performance is an equitable remedy compelling a party to perform their contractual promise when damages are inadequate.',
      explanation: 'It is usually considered when the subject matter is unique and monetary compensation would not provide sufficient relief.'
    }
  ],
  'essay/open response': [
    {
      prompt: 'Discuss the role of intention to create legal relations in contract formation.',
      correctAnswer: 'A strong answer should explain that intention to create legal relations distinguishes enforceable agreements from social or domestic arrangements, discuss the presumptions used by courts, and show how context can rebut those presumptions.',
      explanation: 'The best essays connect objective evidence of intention with the policy reasons for enforcing commercial promises while excluding ordinary social understandings.'
    },
    {
      prompt: 'Analyze the legal consequences of misrepresentation in a contract.',
      correctAnswer: 'A strong answer should define misrepresentation, explain its effect on free consent, classify its forms where relevant, and discuss remedies such as rescission and damages depending on the governing rules.',
      explanation: 'A nuanced answer distinguishes fraudulent, negligent, and innocent misrepresentation and relates those categories to available remedies.'
    },
    {
      prompt: 'Evaluate the doctrine of frustration and its limits.',
      correctAnswer: 'A strong answer should explain that frustration applies when a supervening event makes performance impossible or radically different, while also noting that self-induced hardship or mere increased expense is usually insufficient.',
      explanation: 'This question tests the balance between fairness and contractual certainty when unforeseen events disrupt a bargain.'
    },
    {
      prompt: 'Examine the importance of consideration and the criticisms of the doctrine.',
      correctAnswer: 'A strong answer should describe consideration as the bargain element, explain the functions it serves, and address criticisms that the doctrine can be overly formalistic in modern contract law.',
      explanation: 'High-quality essays combine doctrinal explanation with principled criticism and possible alternatives such as reliance-based reasoning.'
    },
    {
      prompt: 'Discuss the remedies available for breach of contract and the principles guiding their award.',
      correctAnswer: 'A strong answer should cover damages, specific performance, injunctions, and other appropriate relief, while also explaining remoteness, mitigation, causation, and adequacy of damages.',
      explanation: 'The best answers explain both what the remedies are and why courts choose one remedy over another.'
    }
  ]
};

export function getSampleQuestions(subject, questionType, numQuestions, difficulty) {
  const base = coreQuestions[questionType] || coreQuestions['multiple choice'];
  return Array.from({ length: numQuestions }, (_, index) => {
    const template = base[index % base.length];
    return {
      ...template,
      prompt: `[${subject} · ${capitalize(difficulty)}] ${template.prompt}${numQuestions > base.length ? ` (Variant ${index + 1})` : ''}`
    };
  });
}

function capitalize(value) {
  return String(value || '').charAt(0).toUpperCase() + String(value || '').slice(1);
}
