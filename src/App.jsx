import React, { useState, useEffect, useRef } from 'react';
import { Search, Pin, Trash2, Edit2, Copy, CheckCheck, Plus, X, Book } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Color schemes for notes
const noteColors = [
  { bg: "bg-blue-50", border: "border-blue-200", accent: "text-blue-600", hover: "hover:bg-blue-100" },
  { bg: "bg-purple-50", border: "border-purple-200", accent: "text-purple-600", hover: "hover:bg-purple-100" },
  { bg: "bg-green-50", border: "border-green-200", accent: "text-green-600", hover: "hover:bg-green-100" },
  { bg: "bg-amber-50", border: "border-amber-200", accent: "text-amber-600", hover: "hover:bg-amber-100" },
  { bg: "bg-rose-50", border: "border-rose-200", accent: "text-rose-600", hover: "hover:bg-rose-100" },
];

// Subject categories
const subjects = {
  "Constitutional Law": [
    "Fundamental Rights",
    "Directive Principles",
    "Union & States",
    "Emergency Provisions",
    "Constitutional Amendments",
    "Parliamentary Affairs"
  ],
  "Criminal Law": [
    "IPC",
    "CrPC",
    "Evidence Law",
    "Criminal Jurisprudence",
    "Cyber Crimes"
  ],
  "Civil Law": [
    "Contract Law",
    "Property Law",
    "Family Law",
    "Corporate Law",
    "IPR"
  ],
  "Jurisprudence": [
    "Legal Theory",
    "Sources of Law",
    "Legal Concepts",
    "Schools of Jurisprudence",
    "Legal Rights and Duties"
  ],
  "Administrative Law": [
    "Administrative Actions",
    "Principles of Natural Justice",
    "Delegated Legislation",
    "Administrative Discretion",
    "Judicial Review"
  ]
};

const App = () => {
  // State declarations
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [showForm, setShowForm] = useState(false);  // Added missing state
  const [newNote, setNewNote] = useState({
    title: '',
    subtitle: '',
    content: '',
    subject: '',
  });
  const [copySuccess, setCopySuccess] = useState(false);
  
  const formRef = useRef(null);

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('legalNotes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem('legalNotes', JSON.stringify(notes));
  }, [notes]);

  const generateCode = () => {
    if (!newNote.title || !newNote.content) return '';
    
    return `{
    id: ${Date.now()},
    title: "${newNote.title}",
    subtitle: "${newNote.subtitle}",
    content: "${newNote.content.replace(/"/g, '\\"')}",
    subject: "${newNote.subject}",
    isPinned: false,
    timestamp: "${new Date().toISOString()}"
  }`;
  };

  const copyToClipboard = async () => {
    const code = generateCode();
    if (code) {
      try {
        await navigator.clipboard.writeText(code);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    
    if (!newNote.title || !newNote.content || !newNote.subject) {
      return;
    }

    const currentTime = new Date().toISOString();

    if (editingNote) {
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === editingNote
            ? { ...note, ...newNote, timestamp: currentTime }
            : note
        )
      );
    } else {
      const newNoteWithId = {
        ...newNote,
        id: Date.now(),
        isPinned: false,
        timestamp: currentTime,
        colorIndex: Math.floor(Math.random() * noteColors.length)
      };
      setNotes(prevNotes => [...prevNotes, newNoteWithId]);
    }

    setNewNote({ title: '', subtitle: '', content: '', subject: '' });
    setEditingNote(null);
    setShowForm(false);
  };

  const handleEdit = (note) => {
    setEditingNote(note.id);
    setNewNote({
      title: note.title,
      subtitle: note.subtitle,
      content: note.content,
      subject: note.subject
    });
    setShowForm(true);
    scrollToForm();
  };

  const handleDelete = (id) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
  };

  const handlePin = (id) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === id 
          ? { ...note, isPinned: !note.isPinned }
          : note
      )
    );
  };

  const handleInputChange = (e, field) => {
    setNewNote(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubjectChange = (value) => {
    setNewNote(prev => ({
      ...prev,
      subject: value
    }));
  };

  const filteredNotes = notes
    .filter(note => 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a.isPinned === b.isPinned) {
        return new Date(b.timestamp) - new Date(a.timestamp);
      }
      return b.isPinned - a.isPinned;
    });

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Book className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Legal Notes</h1>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingNote(null);
              setNewNote({ title: '', subtitle: '', content: '', subject: '' });
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            <span className="ml-2">{showForm ? 'Close' : 'Add Note'}</span>
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search notes..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {showForm && (
        <form ref={formRef} onSubmit={handleAddNote} className="mb-8">
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-800">
                {editingNote ? 'Edit Note' : 'Add New Note'}
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Title"
                  value={newNote.title}
                  onChange={(e) => handleInputChange(e, 'title')}
                  className="border-gray-200 focus:ring-2 focus:ring-blue-500"
                  required
                />
                <Input
                  placeholder="Subtitle"
                  value={newNote.subtitle}
                  onChange={(e) => handleInputChange(e, 'subtitle')}
                  className="border-gray-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <Select
                value={newNote.subject}
                onValueChange={handleSubjectChange}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select subject category..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(subjects).map(([category, subCategories]) => (
                    <SelectGroup key={category}>
                      <SelectLabel className="font-semibold">{category}</SelectLabel>
                      {subCategories.map((subject) => (
                        <SelectItem 
                          key={subject} 
                          value={subject}
                          className="pl-6"
                        >
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>

              <Textarea
                placeholder="Content"
                value={newNote.content}
                onChange={(e) => handleInputChange(e, 'content')}
                rows={4}
                className="border-gray-200 focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="relative">
                <Textarea
                  value={generateCode()}
                  readOnly
                  rows={8}
                  className="font-mono text-sm bg-gray-50 cursor-text"
                  placeholder="Fill in the fields above to generate code for manual entry..."
                />
                {generateCode() && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={copyToClipboard}
                  >
                    {copySuccess ? <CheckCheck className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </CardContent>
            <CardFooter className="space-x-2">
              <Button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editingNote ? 'Update Note' : 'Add Note'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingNote(null);
                  setNewNote({ title: '', subtitle: '', content: '', subject: '' });
                }}
              >
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}

      {copySuccess && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <AlertDescription>
            Code copied to clipboard successfully!
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map(note => {
          const colorScheme = noteColors[note.colorIndex || 0];
          return (
            <Card 
              key={note.id}
              className={`relative transition-all duration-300 ${colorScheme.bg} ${colorScheme.hover} 
                ${note.isPinned ? 'ring-2 ring-blue-400 shadow-lg' : 'hover:shadow-md'}`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`text-xl font-semibold ${colorScheme.accent}`}>{note.title}</h3>
                    {note.subtitle && (
                      <p className="text-gray-600 mt-1">{note.subtitle}</p>
                    )}
                    <span className={`inline-block ${colorScheme.bg} border ${colorScheme.border} 
                      rounded-full px-3 py-1 text-sm ${colorScheme.accent} mt-2`}>
                      {note.subject}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePin(note.id)}
                      className={`${note.isPinned ? colorScheme.accent : ''}`}
                    >
                      <Pin className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(note)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(note.id)}
                      className="hover:bg-red-100 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{note.content}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default App;
