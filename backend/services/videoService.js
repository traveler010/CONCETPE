/**
 * CONCEPTPE — Video Service
 * Static placeholder educational video lecture data
 * Structured to integrate with YouTube API in future phases
 */

const videosData = [
  {
    id: "vid-math-01",
    title: "Calculus Fundamentals: Geometric Meaning of Derivatives",
    description: "An intuitive visual derivation of limits, tangent lines, and rate of change without memorizing dry formulas.",
    category: "math",
    categoryLabel: "Mathematics",
    duration: "18:45",
    level: "Foundation",
    thumbnailFormula: "∫ f(x) dx",
    thumbnailTopic: "Calculus Demystified",
    youtubeUrl: "https://www.youtube.com/@Conceptpe",
    channel: "@Conceptpe",
    status: "available"
  },
  {
    id: "vid-sci-01",
    title: "Newton's Laws of Motion: Free Body Diagrams Made Simple",
    description: "Step-by-step breakdown of tension, normal reaction, and friction forces with comprehensive solved cases.",
    category: "science",
    categoryLabel: "Science",
    duration: "24:12",
    level: "Core Concept",
    thumbnailFormula: "F = ma",
    thumbnailTopic: "Newtonian Mechanics",
    youtubeUrl: "https://www.youtube.com/@Conceptpe",
    channel: "@Conceptpe",
    status: "available"
  },
  {
    id: "vid-cs-01",
    title: "Binary Search Mastery: Invariant Patterns & Edge Cases",
    description: "Learn the monotonic property, avoid infinite off-by-one loops, and solve search space reduction problems.",
    category: "cs",
    categoryLabel: "Computer Science",
    duration: "16:30",
    level: "Algorithms",
    thumbnailFormula: "O(log n)",
    thumbnailTopic: "Binary Search Logic",
    youtubeUrl: "https://www.youtube.com/@Conceptpe",
    channel: "@Conceptpe",
    status: "available"
  },
  {
    id: "vid-sci-02",
    title: "Chemical Thermodynamics: Gibbs Free Energy & Spontaneity",
    description: "Understanding entropy, enthalpy, and temperature equilibrium relationships with intuitive molecular diagrams.",
    category: "science",
    categoryLabel: "Science",
    duration: "21:50",
    level: "Chemistry",
    thumbnailFormula: "ΔG = ΔH - TΔS",
    thumbnailTopic: "Thermodynamics",
    youtubeUrl: "https://www.youtube.com/@Conceptpe",
    channel: "@Conceptpe",
    status: "available"
  },
  {
    id: "vid-math-02",
    title: "Eigenvalues & Eigenvectors: Geometric Transformation Visualized",
    description: "What does a matrix really do to space? Understand span, transformations, and invariant axes visually.",
    category: "math",
    categoryLabel: "Mathematics",
    duration: "19:15",
    level: "Linear Algebra",
    thumbnailFormula: "det(A - λI) = 0",
    thumbnailTopic: "Linear Algebra",
    youtubeUrl: "https://www.youtube.com/@Conceptpe",
    channel: "@Conceptpe",
    status: "available"
  },
  {
    id: "vid-strat-01",
    title: "The 3-Pass Exam Technique: Maximizing Marks Under Pressure",
    description: "How to triage questions, lock in guaranteed points first, and eliminate time-draining pitfalls on exam day.",
    category: "strategy",
    categoryLabel: "Exam Strategy",
    duration: "14:20",
    level: "Methodology",
    thumbnailFormula: "3-Pass Strategy",
    thumbnailTopic: "Exam Mastery",
    youtubeUrl: "https://www.youtube.com/@Conceptpe",
    channel: "@Conceptpe",
    status: "available"
  }
];

class VideoService {
  async getAllVideos(filterCategory) {
    if (!filterCategory || filterCategory === 'all') {
      return videosData;
    }
    const cleanFilter = filterCategory.trim().toLowerCase();
    return videosData.filter(v => v.category.toLowerCase() === cleanFilter);
  }

  async getVideoById(id) {
    if (!id) return null;
    const cleanId = id.trim().toLowerCase();
    return videosData.find(v => v.id.toLowerCase() === cleanId);
  }
}

module.exports = new VideoService();
