const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const existingProblemCount = await prisma.problem.count();
  if (existingProblemCount > 0) {
    console.log(`Problems already seeded (${existingProblemCount}). Skipping.`);
    return;
  }

  const problems = [
    {
      title: 'Log Difference',
      promptTemplate: 'Compute log({{x}}) - log({{y}}).',
      answerExpression: 'log(x) - log(y)',
      variableSpec: { x: { min: 2, max: 20 }, y: { min: 1, max: 10 } },
      difficulty: 1,
    },
    {
      title: 'Linear Expression',
      promptTemplate: 'Evaluate 3*{{x}} - 2*{{y}}.',
      answerExpression: '3*x - 2*y',
      variableSpec: { x: { min: 1, max: 30 }, y: { min: 1, max: 20 } },
      difficulty: 1,
    },
    {
      title: 'Quadratic Value',
      promptTemplate: 'Evaluate {{x}}^2 + {{y}}.',
      answerExpression: 'x^2 + y',
      variableSpec: { x: { min: 2, max: 12 }, y: { min: 1, max: 30 } },
      difficulty: 2,
    },
    {
      title: 'Fraction Sum',
      promptTemplate: 'Compute {{x}}/{{y}} + {{a}}/{{b}} (decimal form allowed).',
      answerExpression: 'x / y + a / b',
      variableSpec: {
        x: { min: 1, max: 20 },
        y: { min: 2, max: 12 },
        a: { min: 1, max: 20 },
        b: { min: 2, max: 12 },
      },
      tolerance: 0.0001,
      difficulty: 2,
    },
    {
      title: 'Exponential Difference',
      promptTemplate: 'Compute 2^{{x}} - 2^{{y}}.',
      answerExpression: '2^x - 2^y',
      variableSpec: { x: { min: 2, max: 8 }, y: { min: 1, max: 7 } },
      difficulty: 2,
    },
    {
      title: 'Root and Square',
      promptTemplate: 'Evaluate sqrt({{x}}) + {{y}}^2.',
      answerExpression: 'sqrt(x) + y^2',
      variableSpec: { x: { min: 4, max: 144 }, y: { min: 1, max: 10 } },
      tolerance: 0.0001,
      difficulty: 2,
    },
    {
      title: 'Trigonometric Mix',
      promptTemplate: 'Evaluate sin({{x}}) + cos({{y}}) (radians).',
      answerExpression: 'sin(x) + cos(y)',
      variableSpec: { x: { min: 1, max: 6 }, y: { min: 1, max: 6 } },
      tolerance: 0.0001,
      difficulty: 3,
    },
    {
      title: 'Percentage Increase',
      promptTemplate: 'Increase {{x}} by {{y}}%.',
      answerExpression: 'x * (1 + y/100)',
      variableSpec: { x: { min: 20, max: 200 }, y: { min: 5, max: 45 } },
      tolerance: 0.0001,
      difficulty: 2,
    },
    {
      title: 'Absolute Difference',
      promptTemplate: 'Compute |{{x}} - {{y}}| + {{z}}.',
      answerExpression: 'abs(x - y) + z',
      variableSpec: { x: { min: 1, max: 50 }, y: { min: 1, max: 50 }, z: { min: 1, max: 20 } },
      difficulty: 1,
    },
    {
      title: 'Average of Three',
      promptTemplate: 'Find the average of {{x}}, {{y}}, and {{z}}.',
      answerExpression: '(x + y + z) / 3',
      variableSpec: { x: { min: 1, max: 30 }, y: { min: 1, max: 30 }, z: { min: 1, max: 30 } },
      tolerance: 0.0001,
      difficulty: 1,
    },
  ];

  await prisma.problem.createMany({ data: problems });
  console.log(`Seeded ${problems.length} problems.`);
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 