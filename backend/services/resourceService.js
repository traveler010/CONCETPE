/**
 * CONCEPTPE — Resource Service
 * Manages study resources, notes, practice sets, revision sheets
 */

const resourcesData = [
  {
    id: "res-notes-01",
    title: "Chapter-wise Comprehensive Notes",
    description: "Exhaustive concept breakdowns with highlighted definitions, step-by-step mathematical proofs, and visual callout boxes.",
    category: "notes",
    categoryLabel: "Comprehensive Notes",
    type: "Structured PDF",
    tags: ["All Subjects", "Chapter Summaries"],
    url: "/resources/chapter-notes.pdf",
    status: "available",
    downloadable: true
  },
  {
    id: "res-practice-01",
    title: "Graded Practice Problem Sets",
    description: "Tiered question banks from foundational level to advanced competitive questions, each accompanied by detailed logical solutions.",
    category: "practice",
    categoryLabel: "Practice Questions",
    type: "Graded Tiers",
    tags: ["Solved Examples", "Self-Assessment"],
    url: "/resources/practice-sets.pdf",
    status: "available",
    downloadable: true
  },
  {
    id: "res-revision-01",
    title: "Formula Maps & Rapid Cheatsheets",
    description: "Condensed single-sheet formula compendiums and key relation maps organized for high-speed retention before tests.",
    category: "revision",
    categoryLabel: "Revision Material",
    type: "Quick Reference",
    tags: ["Quick Recall", "Print-Ready"],
    url: "/resources/formula-maps.pdf",
    status: "available",
    downloadable: true
  },
  {
    id: "res-concepts-01",
    title: "High-Yield Concept Compendium",
    description: "Deep analyses of notoriously difficult and recurring academic topics that frequently determine higher percentile rankings.",
    category: "concepts",
    categoryLabel: "Important Concepts",
    type: "Deep Dives",
    tags: ["High-Yield", "Conceptual Clarity"],
    url: "/resources/high-yield-concepts.pdf",
    status: "available",
    downloadable: true
  },
  {
    id: "res-exam-01",
    title: "Exam Blueprints & Checklist Kits",
    description: "Strategic test-taking blueprints, topic weightage breakdowns, past pattern evaluations, and syllabus completion trackers.",
    category: "exam",
    categoryLabel: "Exam Preparation",
    type: "Study Blueprint",
    tags: ["Curriculum Aligned", "Strategy"],
    url: "/resources/exam-blueprints.pdf",
    status: "available",
    downloadable: true
  }
];

class ResourceService {
  async getAllResources(filterCategory) {
    if (!filterCategory || filterCategory === 'all') {
      return resourcesData;
    }
    const cleanFilter = filterCategory.trim().toLowerCase();
    return resourcesData.filter(r => r.category.toLowerCase() === cleanFilter);
  }

  async getResourceById(id) {
    if (!id) return null;
    const cleanId = id.trim().toLowerCase();
    return resourcesData.find(r => r.id.toLowerCase() === cleanId);
  }
}

module.exports = new ResourceService();
