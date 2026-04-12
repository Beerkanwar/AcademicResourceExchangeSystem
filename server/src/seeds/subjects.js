// NITJ CSE Department seed data

const cseSubjects = [
  // Semester 1
  { name: 'Mathematics-I', code: 'MA-101', semester: 1, credits: 4, description: 'Calculus, Differential Equations, and Linear Algebra' },
  { name: 'Physics', code: 'PH-101', semester: 1, credits: 4, description: 'Engineering Physics — Mechanics, Waves, Optics' },
  { name: 'Basic Electrical Engineering', code: 'EE-101', semester: 1, credits: 3, description: 'Circuit Theory, AC/DC fundamentals' },
  { name: 'Programming for Problem Solving', code: 'CS-101', semester: 1, credits: 4, description: 'Introduction to C Programming, Logic Building' },
  { name: 'Engineering Graphics', code: 'ME-101', semester: 1, credits: 3, description: 'Engineering Drawing and CAD' },
  { name: 'English Communication', code: 'HS-101', semester: 1, credits: 2, description: 'Technical Communication Skills' },

  // Semester 2
  { name: 'Mathematics-II', code: 'MA-102', semester: 2, credits: 4, description: 'Advanced Calculus, Complex Analysis, Transforms' },
  { name: 'Chemistry', code: 'CH-101', semester: 2, credits: 4, description: 'Engineering Chemistry — Materials, Polymers' },
  { name: 'Basic Electronics Engineering', code: 'EC-101', semester: 2, credits: 3, description: 'Semiconductor Devices, Digital Electronics basics' },
  { name: 'Engineering Mechanics', code: 'ME-102', semester: 2, credits: 3, description: 'Statics and Dynamics' },
  { name: 'Environmental Science', code: 'CY-101', semester: 2, credits: 2, description: 'Environmental Studies and Sustainability' },
  { name: 'Workshop Practice', code: 'ME-103', semester: 2, credits: 2, description: 'Hands-on workshop skills' },

  // Semester 3
  { name: 'Data Structures', code: 'CS-201', semester: 3, credits: 4, description: 'Arrays, Linked Lists, Trees, Graphs, Hashing' },
  { name: 'Digital Logic Design', code: 'CS-202', semester: 3, credits: 4, description: 'Boolean Algebra, Combinational and Sequential Circuits' },
  { name: 'Discrete Mathematics', code: 'MA-201', semester: 3, credits: 3, description: 'Sets, Relations, Graph Theory, Combinatorics' },
  { name: 'Object Oriented Programming', code: 'CS-203', semester: 3, credits: 4, description: 'OOP using C++/Java, Inheritance, Polymorphism' },
  { name: 'Computer Organization', code: 'CS-204', semester: 3, credits: 3, description: 'CPU Architecture, Memory Organization, I/O Systems' },

  // Semester 4
  { name: 'Operating Systems', code: 'CS-301', semester: 4, credits: 4, description: 'Process Management, Memory Management, File Systems' },
  { name: 'Database Management Systems', code: 'CS-302', semester: 4, credits: 4, description: 'SQL, Normalization, Transactions, ER Modeling' },
  { name: 'Theory of Computation', code: 'CS-303', semester: 4, credits: 3, description: 'Automata Theory, Regular Languages, Turing Machines' },
  { name: 'Computer Networks', code: 'CS-304', semester: 4, credits: 4, description: 'OSI Model, TCP/IP, Routing, Network Security' },
  { name: 'Mathematics-III (Probability & Statistics)', code: 'MA-301', semester: 4, credits: 3, description: 'Probability, Random Variables, Statistical Inference' },

  // Semester 5
  { name: 'Design and Analysis of Algorithms', code: 'CS-401', semester: 5, credits: 4, description: 'Divide & Conquer, Dynamic Programming, Greedy, NP-Completeness' },
  { name: 'Software Engineering', code: 'CS-402', semester: 5, credits: 3, description: 'SDLC, Agile, UML, Testing, Project Management' },
  { name: 'Microprocessors and Interfacing', code: 'CS-403', semester: 5, credits: 3, description: '8085/8086 Architecture, Assembly Programming' },
  { name: 'Web Technologies', code: 'CS-404', semester: 5, credits: 3, description: 'HTML, CSS, JavaScript, PHP, Web Frameworks' },
  { name: 'Artificial Intelligence', code: 'CS-405', semester: 5, credits: 3, isElective: true, description: 'Search, Knowledge Representation, Machine Learning basics' },

  // Semester 6
  { name: 'Compiler Design', code: 'CS-501', semester: 6, credits: 4, description: 'Lexical Analysis, Parsing, Code Generation, Optimization' },
  { name: 'Computer Graphics', code: 'CS-502', semester: 6, credits: 3, description: '2D/3D Transformations, Rendering, OpenGL' },
  { name: 'Information Security', code: 'CS-503', semester: 6, credits: 3, description: 'Cryptography, Network Security, Authentication' },
  { name: 'Machine Learning', code: 'CS-504', semester: 6, credits: 3, isElective: true, description: 'Supervised, Unsupervised Learning, Neural Networks' },
  { name: 'Cloud Computing', code: 'CS-505', semester: 6, credits: 3, isElective: true, description: 'Cloud Architecture, Virtualization, AWS/Azure' },

  // Semester 7
  { name: 'Distributed Systems', code: 'CS-601', semester: 7, credits: 3, description: 'Distributed Algorithms, Consistency, Replication' },
  { name: 'Data Mining & Warehousing', code: 'CS-602', semester: 7, credits: 3, isElective: true, description: 'Association Rules, Clustering, Classification' },
  { name: 'Deep Learning', code: 'CS-603', semester: 7, credits: 3, isElective: true, description: 'CNNs, RNNs, GANs, Transformers' },
  { name: 'Internet of Things', code: 'CS-604', semester: 7, credits: 3, isElective: true, description: 'IoT Architecture, Sensors, Protocols, Applications' },
  { name: 'Project-I', code: 'CS-605', semester: 7, credits: 4, description: 'Major Project Phase 1' },

  // Semester 8
  { name: 'Big Data Analytics', code: 'CS-701', semester: 8, credits: 3, isElective: true, description: 'Hadoop, Spark, MapReduce, NoSQL' },
  { name: 'Blockchain Technology', code: 'CS-702', semester: 8, credits: 3, isElective: true, description: 'Distributed Ledger, Smart Contracts, Ethereum' },
  { name: 'Natural Language Processing', code: 'CS-703', semester: 8, credits: 3, isElective: true, description: 'Text Processing, NER, Sentiment Analysis, LLMs' },
  { name: 'Project-II', code: 'CS-704', semester: 8, credits: 8, description: 'Major Project Phase 2 with Thesis' },
];

module.exports = cseSubjects;
