/**
 * CONCEPTPE — Course Service
 * Manages educational courses and modular syllabus data
 */

const coursesData = [
  {
    id: "math-foundations",
    slug: "mathematics",
    title: "Calculus, Algebra & Geometry",
    description: "Master functions, differential & integral calculus, linear algebra, coordinate geometry, and probability through deep intuitive steps.",
    category: "math",
    categoryLabel: "Mathematics",
    badge: "Core Subject",
    image: "/assets/images/conceptpe-logo.png",
    status: "active",
    level: "Foundation to Advanced",
    highlights: [
      "Differential & Integral Calculus",
      "Coordinate Geometry & Vectors",
      "Probability & Statistical Distributions"
    ],
    modules: [
      { name: "Differential Calculus", details: "Limits, Continuity, Differentiation Rules, Tangents & Maxima/Minima" },
      { name: "Integral Calculus", details: "Definite Integrals, Riemann Sums, Area under Curves, Differential Equations" },
      { name: "Vectors & 3D Geometry", details: "Dot & Cross Products, Direction Cosines, Plane & Line Equations" },
      { name: "Linear Algebra & Matrices", details: "Determinants, Matrix Inverses, System of Linear Equations, Eigenvalues" },
      { name: "Probability & Statistics", details: "Conditional Probability, Bayes' Theorem, Discrete & Normal Distributions" }
    ]
  },
  {
    id: "physics-chemistry",
    slug: "physics-chemistry",
    title: "Physics & Chemistry",
    description: "Build a strong understanding of fundamental concepts in Physics and Chemistry through clear and concept-focused learning.",
    category: "physics-chemistry",
    categoryLabel: "Physics & Chemistry",
    badge: "Physical Science",
    image: "/assets/images/conceptpe-logo.png",
    status: "coming-soon",
    level: "Physical Science",
    highlights: [
      "Physics & Chemistry Principles",
      "Physical Science & Basic Concepts",
      "Important Formulas & Concept Revision"
    ],
    topics: [
      "Physics",
      "Chemistry",
      "Physical Science",
      "Basic Concepts",
      "Important Formulas",
      "Concept Revision"
    ],
    modules: []
  },
  {
    id: "biology-life-science",
    slug: "biology",
    title: "Biology & Life Science",
    description: "Understand living organisms, the human body, plants, animals, and the natural world.",
    category: "biology",
    categoryLabel: "Biology & Life Science",
    badge: "Life Science",
    image: "/assets/images/conceptpe-logo.png",
    status: "coming-soon",
    level: "Living Systems",
    highlights: [
      "Human Biology & Body Systems",
      "Plants, Animals & Biodiversity",
      "Nutrition, Health & Ecosystems"
    ],
    topics: [
      "Human Biology",
      "Plants",
      "Animals",
      "Human Body",
      "Nutrition",
      "Health & Hygiene",
      "Ecosystems",
      "Biodiversity"
    ],
    modules: []
  },
  {
    id: "general-knowledge",
    slug: "general-knowledge",
    title: "General Knowledge",
    description: "Build your knowledge with interesting facts, important discoveries, famous personalities, places, inventions, and world knowledge.",
    category: "gk",
    categoryLabel: "General Knowledge",
    badge: "Knowledge Bank",
    image: "/assets/images/conceptpe-logo.png",
    status: "coming-soon",
    level: "World & India Awareness",
    highlights: [
      "Inventions & Major Discoveries",
      "World & Indian Knowledge",
      "Famous Personalities & Key Facts"
    ],
    topics: [
      "World Knowledge",
      "Indian Knowledge",
      "Inventions & Discoveries",
      "Famous Personalities",
      "Important Places",
      "Space & Universe",
      "Technology & Innovation",
      "Interesting Facts"
    ],
    modules: []
  },
  {
    id: "exam-strategy",
    slug: "exam-prep",
    title: "Exam Preparation",
    description: "Targeted frameworks designed to maximize accuracy, manage test anxiety, decode question structures, and avoid negative marking pitfalls.",
    category: "exam",
    categoryLabel: "Exam Preparation",
    badge: "Strategy",
    image: "/assets/images/conceptpe-logo.png",
    status: "active",
    level: "High-Yield Strategy",
    highlights: [
      "High-Yield Problem Solving Tactics",
      "Time Allocation & Mock Test Frameworks",
      "Systematic Error Analysis & Logbooks"
    ],
    modules: [
      { name: "Exam Paper Deconstruction", details: "Analyzing question patterns, mark distribution, and high-probability topics" },
      { name: "The 3-Pass Exam Technique", details: "Triage rounds: guaranteed scoring, moderate calculation, and hard problems" },
      { name: "Speed & Elimination Tactics", details: "Dimensional analysis, boundary checks, and option elimination methods" },
      { name: "Systematic Error Logbook", details: "Categorizing calculation slips vs. conceptual gaps with remediation steps" }
    ]
  },
  {
    id: "concept-revision",
    slug: "concept-revision",
    title: "Concept Revision",
    description: "High-density review modules designed for the final weeks before major assessments. Condense weeks of studying into actionable recall blocks.",
    category: "revision",
    categoryLabel: "Concept Revision",
    badge: "Rapid Recall",
    image: "/assets/images/conceptpe-logo.png",
    status: "active",
    level: "Quick Review",
    highlights: [
      "Comprehensive One-Page Formula Maps",
      "Key Concept Traps & Counterexamples",
      "Flash Recall & Diagnostic Checkpoints"
    ],
    modules: [
      { name: "Single-Page Formula Summaries", details: "High-density equation cheatsheets with unit dimensions and conditions" },
      { name: "Key Concept Counterexamples", details: "Highlighting frequent examiner traps and conceptual misconceptions" },
      { name: "Active Retrieval Flash Cards", details: "Fast self-diagnostic quizzes to reinforce long-term memory" }
    ]
  }
];

class CourseService {
  async getAllCourses(filterCategory) {
    if (!filterCategory || filterCategory === 'all') {
      return coursesData;
    }
    const cleanFilter = filterCategory.trim().toLowerCase();
    return coursesData.filter(course => 
      course.category.toLowerCase() === cleanFilter ||
      course.slug.toLowerCase() === cleanFilter
    );
  }

  async getCourseById(id) {
    if (!id) return null;
    const cleanId = id.trim().toLowerCase();
    return coursesData.find(c => 
      c.id.toLowerCase() === cleanId || 
      c.slug.toLowerCase() === cleanId
    );
  }
}

module.exports = new CourseService();
