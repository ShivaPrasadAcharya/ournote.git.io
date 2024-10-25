import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, ChevronDown, ChevronUp, Trash2, Edit2, X, Pin, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

// You can add manual notes here in this format
const EXAMPLE_NOTES = [
    {
        id: new Date('2024-10-25 12:00:00').getTime(),
        title: "Welcome Note",
        subtitle: "Getting Started",
        content: "Welcome to the Notes App! This is a simple notes application where you can create, edit, and organize your notes. You can pin important notes (up to 7) to keep them at the top. Feel free to add more notes below this example.",
        createdAt: new Date('2024-10-25 12:00:00').toLocaleString(),
        lastEdited: new Date('2024-10-25 12:00:00').toLocaleString(),
        color: "hsl(200, 70%, 95%)",
        isPinned: true
    },
    {
        id: new Date('2024-10-25 12:05:00').getTime(),
        title: "Meeting Notes",
        subtitle: "Project Planning",
        content: "Key points discussed:\n1. Project timeline review\n2. Resource allocation\n3. Budget considerations\n4. Next steps and action items",
        createdAt: new Date('2024-10-25 12:05:00').toLocaleString(),
        lastEdited: new Date('2024-10-25 12:05:00').toLocaleString(),
        color: "hsl(150, 70%, 95%)",
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
    const [notification, setNotification] = useState({ show: false, message: '', type: 'default' });
    const [showInputForm, setShowInputForm] = useState(false);
    const [expandedNotes, setExpandedNotes] = useState(new Set());
    const [generatedCode, setGeneratedCode] = useState('');

    useEffect(() => {
        const savedNotes = localStorage.getItem('notes');
        if (savedNotes) {
            setNotes(JSON.parse(savedNotes));
        } else {
            setNotes(EXAMPLE_NOTES);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('notes', JSON.stringify(notes));
    }, [notes]);

    useEffect(() => {
        // Generate code whenever title, subtitle, or content changes
        if (title || subtitle || content) {
            const timestamp = new Date();
            const noteObject = {
                id: timestamp.getTime(),
                title: title.trim(),
                subtitle: subtitle.trim(),
                content: content.trim(),
                createdAt: timestamp.toLocaleString(),
                lastEdited: timestamp.toLocaleString(),
                color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 95%)`,
                isPinned: false
            };
            
            setGeneratedCode(JSON.stringify(noteObject, null, 4));
        } else {
            setGeneratedCode('');
        }
    }, [title, subtitle, content]);

    const showNotification = (message, type = 'default') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'default' }), 3000);
    };

    const getRandomColor = () => {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 95%)`;
    };

    const handleAddNote = () => {
        if (!title.trim() || !content.trim()) {
            showNotification('Please fill in both title and content!', 'error');
            return;
        }

        const timestamp = new Date();
        const newNote = {
            id: timestamp.getTime(),
            title: title.trim(),
            subtitle: subtitle.trim(),
            content: content.trim(),
            createdAt: timestamp.toLocaleString(),
            lastEdited: timestamp.toLocaleString(),
            color: getRandomColor(),
            isPinned: false
        };

        setNotes([newNote, ...notes]);
        clearForm();
        showNotification('Note added successfully');
    };

    const handleEditNote = () => {
        const timestamp = new Date();
        setNotes(notes.map(note => 
            note.id === editingId 
                ? {
                    ...note,
                    title: title.trim(),
                    subtitle: subtitle.trim(),
                    content: content.trim(),
                    lastEdited: timestamp.toLocaleString()
                  }
                : note
        ));
        clearForm();
        showNotification('Note updated successfully');
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(generatedCode);
        showNotification('Code copied to clipboard!');
    };

    const handleDeleteNote = (id) => {
        setNotes(notes.filter(note => note.id !== id));
        showNotification('Note deleted');
    };

    const handlePinNote = (id) => {
        const pinnedCount = notes.filter(note => note.isPinned).length;
        const isCurrentlyPinned = notes.find(note => note.id === id)?.isPinned;

        if (!isCurrentlyPinned && pinnedCount >= 7) {
            showNotification('Maximum 7 notes can be pinned!', 'error');
            return;
        }

        setNotes(notes.map(note =>
            note.id === id ? { ...note, isPinned: !note.isPinned } : note
        ));
    };

    const handleEditStart = (note) => {
        setEditingId(note.id);
        setTitle(note.title);
        setSubtitle(note.subtitle || '');
        setContent(note.content);
        setShowInputForm(true);
    };

    const clearForm = () => {
        setTitle('');
        setSubtitle('');
        setContent('');
        setShowInputForm(false);
        setEditingId(null);
        setGeneratedCode('');
    };

    const toggleNoteExpansion = (id) => {
        setExpandedNotes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const getFilteredNotes = () => {
        let filtered = notes;
        
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(note => 
                note.title.toLowerCase().includes(search) ||
                note.subtitle?.toLowerCase().includes(search) ||
                note.content.toLowerCase().includes(search)
            );
        }

        return filtered.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return b.id - a.id; // Sort by timestamp
        });
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    const renderNoteCard = (note) => (
        <Card 
            key={note.id}
            className="transform transition-all duration-200 hover:shadow-lg relative"
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
                                <h4 className="text-sm text-gray-600 mb-2 underline decoration-gray-400">
                                    {note.subtitle}
                                </h4>
                            )}
                            <div className="text-gray-700 whitespace-pre-wrap">
                                {expandedNotes.has(note.id) ? note.content : 
                                    note.content.length > 150 ? `${note.content.slice(0, 150)}...` : note.content}
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
                        <div className="flex flex-col gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handlePinNote(note.id)}
                                className={note.isPinned ? "text-blue-500" : "text-gray-500"}
                            >
                                <Pin className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditStart(note)}
                            >
                                <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteNote(note.id)}
                            >
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-4">
                        <div>Created: {formatTimestamp(note.id)}</div>
                        {note.lastEdited !== note.createdAt && 
                            <div>Last edited: {note.lastEdited}</div>
                        }
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <Card className="bg-white shadow-lg">
                <CardHeader className="relative border-b">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold">My Notes</CardTitle>
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
                <CardContent className="space-y-6 p-6">
                    <div className="flex gap-4">
                        <div className="flex-grow">
                            <Input
                                placeholder="Search notes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full"
                                icon={<Search className="w-4 h-4" />}
                            />
                        </div>
                    </div>

                    {showInputForm && (
                        <div className="space-y-4 p-6 bg-gray-50 rounded-lg shadow-inner">
                            <Input
                                placeholder="Note Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full text-lg font-medium"
                            />
                            <Input
                                placeholder="Subtitle (optional)"
                                value={subtitle}
                                onChange={(e) => setSubtitle(e.target.value)}
                                className="w-full text-md"
                            />
                            <Textarea
                                placeholder="Write your note here..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full min-h-[150px] text-md"
                            />
                            {(title || subtitle || content) && (
                                <div className="relative">
                                    <Textarea
                                        value={generatedCode}
                                        readOnly
                                        className="w-full min-h-[200px] font-mono text-sm bg-gray-100"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCopyCode}
                                        className="absolute top-2 right-2"
                                    >
                                        <Copy className="w-4 h-4 mr-1" />
                                        Copy
                                    </Button>
                                </div>
                            )}
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={clearForm}>
                                    Cancel
                                </Button>
                                <Button onClick={editingId ? handleEditNote : handleAddNote}>
                                    {editingId ? 'Save Changes' : 'Add Note'}
                                </Button>
                            </div>
                        </div>
                    )}
                    
                    {notification.show && (
                        <Alert variant={notification.type === 'error' ? 'destructive' : 'default'}>
                            <AlertDescription>{notification.message}</AlertDescription>
                        </Alert>
                    )}
                    
                    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                        {getFilteredNotes().map(renderNoteCard)}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default NotesApp;
