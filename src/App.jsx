import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, Search, ChevronDown, ChevronUp, Trash2, Edit2, Save, X, Pin, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DEFAULT_NOTES = [
  {
    id: 1,
    title: "Welcome to Notes App",
    subtitle: "Getting Started Guide",
    content: "Welcome to your new notes application! This is a default note to help you get started. Pin important notes, use the search feature, and organize your thoughts easily.",
    createdAt: new Date().toLocaleString(),
    lastEdited: new Date().toLocaleString(),
    color: "#f0f9ff",
    isPinned: true
  },
  {
    id: 2,
    title: "Quick Tips",
    subtitle: "Making the Most of Your Notes",
    content: "1. Pin important notes to keep them at the top\n2. Use the search bar to find specific notes\n3. Add subtitles for better organization\n4. Click 'Read More' to expand long notes",
    createdAt: new Date().toLocaleString(),
    lastEdited: new Date().toLocaleString(),
    color: "#f0fdf4",
    isPinned: false
  }
];

const NotesApp = () => {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showInputForm, setShowInputForm] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState(new Set());
  const [filterType, setFilterType] = useState('all');
  
  const titleInputRef = useRef(null);
  const inputFormRef = useRef(null);

  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    } else {
      setNotes(DEFAULT_NOTES);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (editingId && inputFormRef.current) {
      inputFormRef.current.scrollIntoView({ behavior: 'smooth' });
      titleInputRef.current?.focus();
    }
  }, [editingId]);

  const showAlertMessage = (message, duration = 3000) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), duration);
  };

  const getRandomPastelColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 97%)`;
  };

  const toggleNoteExpansion = (id) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNotes(newExpanded);
  };

  const addNote = () => {
    if (!title.trim() || !content.trim()) {
      showAlertMessage('Please fill in both title and content!');
      return;
    }

    const newNote = {
      id: Date.now(),
      title: title.trim(),
      subtitle: subtitle.trim(),
      content: content.trim(),
      createdAt: new Date().toLocaleString(),
      lastEdited: new Date().toLocaleString(),
      color: getRandomPastelColor(),
      isPinned: false
    };

    setNotes([newNote, ...notes]);
    clearForm();
  };

  const clearForm = () => {
    setTitle('');
    setSubtitle('');
    setContent('');
    setShowInputForm(false);
    setEditingId(null);
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const startEditing = (note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setSubtitle(note.subtitle);
    setContent(note.content);
    setShowInputForm(true);
  };

  const saveEdit = () => {
    setNotes(notes.map(note => 
      note.id === editingId 
        ? { 
            ...note, 
            title: title.trim(), 
            subtitle: subtitle.trim(),
            content: content.trim(), 
            lastEdited: new Date().toLocaleString() 
          }
        : note
    ));
    clearForm();
  };

  const togglePin = (id) => {
    const pinnedCount = notes.filter(note => note.isPinned).length;
    const note = notes.find(n => n.id === id);
    
    if (!note.isPinned && pinnedCount >= 7) {
      showAlertMessage('You can only pin up to 7 notes!');
      return;
    }

    setNotes(notes.map(note => 
      note.id === id 
        ? { ...note, isPinned: !note.isPinned }
        : note
    ));
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const filterNotes = () => {
    let filtered = notes;

    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (filterType) {
      case 'pinned':
        filtered = filtered.filter(note => note.isPinned);
        break;
      case 'unpinned':
        filtered = filtered.filter(note => !note.isPinned);
        break;
    }

    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  const renderNote = (note) => (
    <Card 
      key={note.id}
      className="transform transition-all duration-200 hover:shadow-xl relative"
      style={{ backgroundColor: note.color }}
    >
      {note.isPinned && (
        <div className="absolute -top-2 -left-2 bg-blue-500 text-white rounded-full p-1 z-10">
          <Pin className="w-4 h-4" />
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex flex-col">
          <div className="flex justify-between items-start">
            <div className="flex-grow pr-4">
              <h3 className="font-semibold text-lg mb-1">{note.title}</h3>
              {note.subtitle && (
                <h4 className="text-sm text-gray-600 mb-2 underline decoration-gray-400">{note.subtitle}</h4>
              )}
              <div className="text-gray-700 whitespace-pre-wrap">
                {expandedNotes.has(note.id) ? note.content : truncateText(note.content)}
              </div>
              {note.content.length > 150 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleNoteExpansion(note.id)}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  {expandedNotes.has(note.id) 
                    ? <><ChevronUp className="w-4 h-4 mr-1" /> Show Less</>
                    : <><ChevronDown className="w-4 h-4 mr-1" /> Read More</>}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => togglePin(note.id)}
                className={note.isPinned ? "text-blue-500" : "text-gray-500"}
              >
                <Pin className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => startEditing(note)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteNote(note.id)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
            <span>Created: {note.createdAt}</span>
            <span>Last edited: {note.lastEdited}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="bg-white shadow-lg">
        <CardHeader className="relative">
          <CardTitle className="text-2xl font-bold text-center">My Notes</CardTitle>
          <div className="absolute right-4 top-4 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInputForm(!showInputForm)}
              className="text-gray-600 hover:text-gray-900"
            >
              {showInputForm ? <X className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter notes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notes</SelectItem>
                <SelectItem value="pinned">Pinned Only</SelectItem>
                <SelectItem value="unpinned">Unpinned Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showInputForm && (
            <div ref={inputFormRef} className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <Input
                ref={titleInputRef}
                placeholder="Note Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
              />
              <Input
                placeholder="Subtitle (optional)"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full"
              />
              <Textarea
                placeholder="Write your note here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[100px]"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={clearForm}>
                  Cancel
                </Button>
                <Button onClick={editingId ? saveEdit : addNote}>
                  {editingId ? 'Save Changes' : 'Add Note'}
                </Button>
              </div>
            </div>
          )}

          {showAlert && (
            <Alert variant="destructive">
              <AlertDescription>{alertMessage}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 mt-6">
            {filterNotes().map(renderNote)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotesApp;
