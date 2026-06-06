interface GlossaryDefinition {
  term: string;
  definition: string;
  category: string;
  language?: string;
}

const GLOSSARY_TERMS: GlossaryDefinition[] = [
  { term: 'variable', definition: 'A named storage location for data that can change during program execution.', category: 'variables' },
  { term: 'constant', definition: 'A value that does not change during program execution.', category: 'variables' },
  { term: 'literal', definition: 'A fixed value written directly in source code, like 42 or "hello".', category: 'variables' },
  { term: 'identifier', definition: 'A name given to a variable, function, class, or other program element.', category: 'variables' },
  { term: 'scope', definition: 'The region of code where a variable or function is accessible.', category: 'variables' },
  { term: 'hoisting', definition: 'JavaScript behavior where variable and function declarations are moved to the top of their scope before execution.', category: 'variables', language: 'javascript' },
  { term: 'mutability', definition: 'Whether a variable\'s value can be changed after it is created.', category: 'variables' },
  { term: 'type coercion', definition: 'Automatic or implicit conversion of a value from one data type to another.', category: 'variables' },
  { term: 'function', definition: 'A reusable block of code that performs a specific task when called.', category: 'functions' },
  { term: 'parameter', definition: 'A variable listed in a function\'s definition that receives a value when the function is called.', category: 'functions' },
  { term: 'argument', definition: 'A value passed to a function when it is called.', category: 'functions' },
  { term: 'return value', definition: 'The value that a function sends back to the caller after execution.', category: 'functions' },
  { term: 'callback', definition: 'A function passed as an argument to another function, to be executed later.', category: 'functions' },
  { term: 'higher-order function', definition: 'A function that takes another function as an argument or returns a function.', category: 'functions' },
  { term: 'arrow function', definition: 'A concise syntax for writing functions in JavaScript using => notation.', category: 'functions', language: 'javascript' },
  { term: 'lambda', definition: 'An anonymous function that can be defined inline and used as a value.', category: 'functions' },
  { term: 'closure', definition: 'A function that retains access to variables from its outer scope even after the outer function has returned.', category: 'functions' },
  { term: 'recursion', definition: 'A technique where a function calls itself to solve smaller instances of the same problem.', category: 'functions' },
  { term: 'tail recursion', definition: 'A recursion where the recursive call is the last operation in the function, allowing optimization.', category: 'functions' },
  { term: 'pure function', definition: 'A function that always produces the same output for the same input and has no side effects.', category: 'functions' },
  { term: 'side effect', definition: 'Any change in program state or interaction with the outside world that occurs when a function runs.', category: 'functions' },
  { term: 'class', definition: 'A blueprint for creating objects with shared properties and methods.', category: 'oop' },
  { term: 'object', definition: 'A collection of related data and behaviors, typically representing a real-world entity.', category: 'oop' },
  { term: 'instance', definition: 'A specific object created from a class.', category: 'oop' },
  { term: 'constructor', definition: 'A special method called when a new instance of a class is created.', category: 'oop' },
  { term: 'property', definition: 'A named value stored on an object, representing its state or attribute.', category: 'oop' },
  { term: 'method', definition: 'A function that belongs to an object or class.', category: 'oop' },
  { term: 'inheritance', definition: 'A mechanism where a class derives properties and methods from another class.', category: 'oop' },
  { term: 'polymorphism', definition: 'The ability of objects of different types to respond to the same method call in their own way.', category: 'oop' },
  { term: 'encapsulation', definition: 'Bundling data and methods together while hiding internal details from outside access.', category: 'oop' },
  { term: 'abstraction', definition: 'Hiding complex implementation details and exposing only essential features.', category: 'oop' },
  { term: 'interface', definition: 'A contract that defines a set of methods or properties a class must implement.', category: 'oop' },
  { term: 'abstract class', definition: 'A class that cannot be instantiated and is meant to be subclassed by other classes.', category: 'oop' },
  { term: 'type', definition: 'A classification of data that defines the values it can hold and operations on it.', category: 'oop' },
  { term: 'generic', definition: 'A programming construct that allows types to be parameters, enabling reusable components.', category: 'oop' },
  { term: 'mixin', definition: 'A class that provides methods to other classes without being a parent class.', category: 'oop' },
  { term: 'trait', definition: 'A collection of methods that can be used to extend the behavior of classes.', category: 'oop' },
  { term: 'decorator', definition: 'A design pattern that adds behavior to an object dynamically without modifying its structure.', category: 'patterns' },
  { term: 'singleton', definition: 'A design pattern ensuring a class has only one instance and provides a global access point.', category: 'patterns' },
  { term: 'factory', definition: 'A design pattern that creates objects without exposing the instantiation logic to the caller.', category: 'patterns' },
  { term: 'observer', definition: 'A design pattern where an object notifies dependents of state changes automatically.', category: 'patterns' },
  { term: 'strategy', definition: 'A design pattern that lets you define a family of algorithms and make them interchangeable.', category: 'patterns' },
  { term: 'dependency injection', definition: 'A technique where an object receives its dependencies from an external source rather than creating them.', category: 'patterns' },
  { term: 'proxy', definition: 'A design pattern that provides a placeholder for another object to control access to it.', category: 'patterns' },
  { term: 'adapter', definition: 'A design pattern that allows incompatible interfaces to work together.', category: 'patterns' },
  { term: 'iterator', definition: 'A design pattern that provides a way to access elements of a collection sequentially.', category: 'patterns' },
  { term: 'composite', definition: 'A design pattern that treats individual objects and compositions of objects uniformly.', category: 'patterns' },
  { term: 'array', definition: 'An ordered collection of elements stored at contiguous memory locations.', category: 'data-structures' },
  { term: 'list', definition: 'An ordered sequence of elements that can grow or shrink dynamically.', category: 'data-structures' },
  { term: 'linked list', definition: 'A data structure where each element contains a reference to the next element in the sequence.', category: 'data-structures' },
  { term: 'map', definition: 'A collection of key-value pairs where each key is unique.', category: 'data-structures' },
  { term: 'dictionary', definition: 'Another name for a map or associative array that stores key-value pairs.', category: 'data-structures' },
  { term: 'set', definition: 'A collection of unique elements with no duplicates allowed.', category: 'data-structures' },
  { term: 'stack', definition: 'A last-in-first-out (LIFO) data structure where elements are added and removed from the top.', category: 'data-structures' },
  { term: 'queue', definition: 'A first-in-first-out (FIFO) data structure where elements are added at the back and removed from the front.', category: 'data-structures' },
  { term: 'deque', definition: 'A double-ended queue allowing insertion and removal at both ends.', category: 'data-structures' },
  { term: 'tree', definition: 'A hierarchical data structure with a root node and child nodes forming branches.', category: 'data-structures' },
  { term: 'binary tree', definition: 'A tree where each node has at most two child nodes.', category: 'data-structures' },
  { term: 'binary search tree', definition: 'A binary tree where left children are smaller and right children are larger than the parent.', category: 'data-structures' },
  { term: 'heap', definition: 'A complete binary tree where each parent is greater (max-heap) or smaller (min-heap) than its children.', category: 'data-structures' },
  { term: 'graph', definition: 'A data structure consisting of nodes (vertices) connected by edges.', category: 'data-structures' },
  { term: 'hash', definition: 'A value computed from input data using a function, used for fast lookup and data integrity.', category: 'data-structures' },
  { term: 'hash table', definition: 'A data structure that maps keys to values using a hash function for fast access.', category: 'data-structures' },
  { term: 'trie', definition: 'A tree-like data structure used for storing strings, where each node represents a character.', category: 'data-structures' },
  { term: 'bloom filter', definition: 'A space-efficient probabilistic data structure for testing set membership.', category: 'data-structures' },
  { term: 'algorithm', definition: 'A step-by-step procedure for solving a problem or accomplishing a task.', category: 'algorithms' },
  { term: 'iteration', definition: 'Repeating a process or set of instructions multiple times.', category: 'algorithms' },
  { term: 'sorting', definition: 'Arranging elements in a specific order, such as ascending or descending.', category: 'algorithms' },
  { term: 'searching', definition: 'Finding a specific element or value within a collection of data.', category: 'algorithms' },
  { term: 'binary search', definition: 'An efficient algorithm that finds a target value in a sorted array by repeatedly dividing the search space in half.', category: 'algorithms' },
  { term: 'depth-first search', definition: 'A graph and tree traversal algorithm that explores as far as possible along each branch before backtracking.', category: 'algorithms' },
  { term: 'breadth-first search', definition: 'A graph and tree traversal algorithm that explores all neighbors at the current depth before moving deeper.', category: 'algorithms' },
  { term: 'dynamic programming', definition: 'A technique for solving problems by breaking them into overlapping subproblems and storing results.', category: 'algorithms' },
  { term: 'greedy algorithm', definition: 'An algorithm that makes the locally optimal choice at each step hoping to find the global optimum.', category: 'algorithms' },
  { term: 'divide and conquer', definition: 'An algorithm design paradigm that divides a problem into smaller subproblems and combines their solutions.', category: 'algorithms' },
  { term: 'backtracking', definition: 'A technique that explores all potential solutions by building candidates and abandoning those that fail.', category: 'algorithms' },
  { term: 'big O notation', definition: 'A mathematical notation describing the upper bound of an algorithm\'s time or space complexity.', category: 'algorithms' },
  { term: 'time complexity', definition: 'A measure of how the runtime of an algorithm grows as the input size increases.', category: 'algorithms' },
  { term: 'space complexity', definition: 'A measure of how much memory an algorithm uses as the input size grows.', category: 'algorithms' },
  { term: 'promise', definition: 'An object representing the eventual completion or failure of an asynchronous operation.', category: 'concurrency' },
  { term: 'async', definition: 'A keyword that declares a function as asynchronous, allowing the use of await inside it.', category: 'concurrency' },
  { term: 'await', definition: 'A keyword that pauses execution of an async function until a promise settles.', category: 'concurrency' },
  { term: 'thread', definition: 'The smallest unit of execution within a process, capable of running independently.', category: 'concurrency' },
  { term: 'process', definition: 'An instance of a program in execution with its own memory space.', category: 'concurrency' },
  { term: 'mutex', definition: 'A synchronization primitive that prevents multiple threads from accessing a shared resource simultaneously.', category: 'concurrency' },
  { term: 'semaphore', definition: 'A synchronization primitive that controls access to a shared resource through a counter.', category: 'concurrency' },
  { term: 'deadlock', definition: 'A situation where two or more threads are blocked forever, each waiting for a resource held by another.', category: 'concurrency' },
  { term: 'race condition', definition: 'A bug where the behavior of software depends on the timing of uncontrollable events like thread scheduling.', category: 'concurrency' },
  { term: 'critical section', definition: 'A part of code that accesses shared resources and must not be executed by multiple threads simultaneously.', category: 'concurrency' },
  { term: 'event loop', definition: 'A programming construct that waits for and dispatches events or messages in a program.', category: 'concurrency' },
  { term: 'API', definition: 'Application Programming Interface - a set of rules allowing software applications to communicate.', category: 'web' },
  { term: 'REST', definition: 'Representational State Transfer - an architectural style for designing networked applications using HTTP.', category: 'web' },
  { term: 'HTTP', definition: 'Hypertext Transfer Protocol - the foundation protocol for data communication on the web.', category: 'web' },
  { term: 'HTTPS', definition: 'HTTP over SSL/TLS - a secure version of HTTP with encryption.', category: 'web' },
  { term: 'JSON', definition: 'JavaScript Object Notation - a lightweight text format for storing and exchanging structured data.', category: 'web' },
  { term: 'XML', definition: 'Extensible Markup Language - a markup language for encoding documents in a format readable by both humans and machines.', category: 'web' },
  { term: 'middleware', definition: 'Software that sits between the request and response in a web application pipeline.', category: 'web' },
  { term: 'router', definition: 'A component that maps incoming requests to specific handlers based on URL and HTTP method.', category: 'web' },
  { term: 'controller', definition: 'A component that handles incoming requests and returns responses in an MVC architecture.', category: 'web' },
  { term: 'service', definition: 'A layer in application architecture containing business logic, separate from presentation and data access.', category: 'web' },
  { term: 'repository', definition: 'A pattern that abstracts data access logic, providing a collection-like interface for domain objects.', category: 'web' },
  { term: 'CDN', definition: 'Content Delivery Network - a distributed network of servers that delivers web content based on user location.', category: 'web' },
  { term: 'DNS', definition: 'Domain Name System - translates human-readable domain names into IP addresses.', category: 'web' },
  { term: 'SQL', definition: 'Structured Query Language - a standard language for managing and querying relational databases.', category: 'databases' },
  { term: 'NoSQL', definition: 'A category of database systems that do not use traditional relational table structures.', category: 'databases' },
  { term: 'index', definition: 'A database structure that improves the speed of data retrieval operations on a table.', category: 'databases' },
  { term: 'join', definition: 'A SQL operation that combines rows from two or more tables based on a related column.', category: 'databases' },
  { term: 'query', definition: 'A request for data or information from a database.', category: 'databases' },
  { term: 'transaction', definition: 'A sequence of database operations treated as a single unit of work that must all succeed or all fail.', category: 'databases' },
  { term: 'ACID', definition: 'Atomicity, Consistency, Isolation, Durability - properties that guarantee reliable database transaction processing.', category: 'databases' },
  { term: 'normalization', definition: 'The process of organizing database fields and tables to reduce redundancy and improve integrity.', category: 'databases' },
  { term: 'denormalization', definition: 'Adding redundancy to a database to improve read performance by reducing joins.', category: 'databases' },
  { term: 'migration', definition: 'A controlled set of changes to a database schema, managed through versioned scripts.', category: 'databases' },
  { term: 'ORM', definition: 'Object-Relational Mapping - a technique for converting data between relational databases and object-oriented languages.', category: 'databases' },
  { term: 'cache', definition: 'A temporary storage layer that stores frequently accessed data for faster retrieval.', category: 'misc' },
  { term: 'garbage collection', definition: 'Automatic memory management that reclaims memory occupied by objects no longer in use.', category: 'misc' },
  { term: 'memory leak', definition: 'A bug where a program fails to release memory that is no longer needed, causing consumption to grow.', category: 'misc' },
  { term: 'buffer', definition: 'A temporary storage area for data being transferred between two processes or devices.', category: 'misc' },
  { term: 'stream', definition: 'A sequence of data elements made available over time, processed incrementally.', category: 'misc' },
  { term: 'SSL', definition: 'Secure Sockets Layer - a cryptographic protocol for secure communication over a network.', category: 'misc' },
  { term: 'TLS', definition: 'Transport Layer Security - the successor to SSL for secure network communications.', category: 'misc' },
  { term: 'encryption', definition: 'The process of encoding information so that only authorized parties can access it.', category: 'misc' },
  { term: 'hashing', definition: 'Converting data into a fixed-size string of characters that uniquely represents the original data.', category: 'misc' },
  { term: 'salt', definition: 'Random data added to input before hashing to prevent precomputed dictionary attacks.', category: 'misc' },
  { term: 'JWT', definition: 'JSON Web Token - a compact, URL-safe token format for securely transmitting claims between parties.', category: 'misc' },
  { term: 'OAuth', definition: 'An open standard for token-based authentication and authorization on the internet.', category: 'misc' },
  { term: 'compiler', definition: 'A program that translates source code written in a high-level language into machine code.', category: 'misc' },
  { term: 'interpreter', definition: 'A program that executes source code directly without compiling it to machine code first.', category: 'misc' },
  { term: 'transpiler', definition: 'A tool that converts source code from one programming language to another at a similar abstraction level.', category: 'misc' },
  { term: 'polyfill', definition: 'Code that implements a feature on browsers that do not support it natively.', category: 'misc', language: 'javascript' },
  { term: 'shim', definition: 'A small library that intercepts API calls and provides compatibility layers.', category: 'misc' },
  { term: 'refactoring', definition: 'Restructuring existing code without changing its external behavior to improve its internal structure.', category: 'misc' },
  { term: 'technical debt', definition: 'The implied cost of additional rework caused by choosing an easy solution now instead of a better approach.', category: 'misc' },
  { term: 'debugging', definition: 'The process of identifying and removing errors or bugs from software.', category: 'misc' },
  { term: 'profiling', definition: 'Analyzing a program to measure memory usage, time complexity, or performance bottlenecks.', category: 'misc' },
  { term: 'unit test', definition: 'A test that verifies the behavior of a single, isolated unit of code.', category: 'misc' },
  { term: 'integration test', definition: 'A test that verifies the interaction between multiple components or systems.', category: 'misc' },
  { term: 'end-to-end test', definition: 'A test that validates the entire application workflow from start to finish.', category: 'misc' },
  { term: 'mock', definition: 'A simulated object that mimics the behavior of a real dependency for testing purposes.', category: 'misc' },
  { term: 'stub', definition: 'A minimal implementation of a function or object used for testing.', category: 'misc' },
  { term: 'linter', definition: 'A tool that analyzes source code for potential errors, bugs, or style violations.', category: 'misc' },
  { term: 'minification', definition: 'The process of removing unnecessary characters from source code to reduce its size.', category: 'misc' },
  { term: 'bundler', definition: 'A tool that combines multiple source files into a single file for distribution.', category: 'misc' },
  { term: 'module', definition: 'A self-contained unit of code that can be imported and used by other modules.', category: 'misc' },
  { term: 'package manager', definition: 'A tool that automates the process of installing, updating, and managing software dependencies.', category: 'misc' },
  { term: 'semver', definition: 'Semantic Versioning - a versioning scheme using major.minor.patch to indicate compatibility.', category: 'misc' },
  { term: 'REPL', definition: 'Read-Eval-Print Loop - an interactive programming environment that evaluates expressions one at a time.', category: 'misc' },
  { term: 'IDE', definition: 'Integrated Development Environment - a software application for writing and debugging code.', category: 'misc' },
];

export class Glossary {
  private terms: Map<string, GlossaryDefinition>;

  constructor() {
    this.terms = new Map();
    for (const entry of GLOSSARY_TERMS) {
      const key = entry.term.toLowerCase();
      if (!this.terms.has(key)) {
        this.terms.set(key, entry);
      }
    }
  }

  getDefinition(term: string): string | null {
    const key = term.toLowerCase().trim();
    const entry = this.terms.get(key);
    return entry ? entry.definition : null;
  }

  searchDefinitions(query: string): GlossaryDefinition[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const results: GlossaryDefinition[] = [];
    for (const entry of this.terms.values()) {
      if (entry.term.toLowerCase().includes(q) || entry.definition.toLowerCase().includes(q)) {
        results.push(entry);
      }
    }
    return results;
  }

  getTermsByLanguage(language: string): GlossaryDefinition[] {
    const lang = language.toLowerCase().trim();
    if (!lang) return [];
    return GLOSSARY_TERMS.filter(entry => entry.language && entry.language === lang);
  }

  getTermsByCategory(category: string): GlossaryDefinition[] {
    const cat = category.toLowerCase().trim();
    return GLOSSARY_TERMS.filter(entry => entry.category === cat);
  }

  getAllTerms(): GlossaryDefinition[] {
    return [...GLOSSARY_TERMS];
  }

  getCategories(): string[] {
    const cats = new Set<string>();
    for (const entry of GLOSSARY_TERMS) {
      cats.add(entry.category);
    }
    return Array.from(cats);
  }
}
