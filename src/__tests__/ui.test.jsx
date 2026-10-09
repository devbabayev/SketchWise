import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminPanel from '../components/AdminPanel.jsx';
import FileUploader from '../components/FileUploader.jsx';

// Mock fetch globally
global.fetch = vi.fn();

describe('UI Tests: AdminPanel', () => {
  it('renders correctly and checks token status', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ hasToken: false })
    });

    render(<AdminPanel />);
    expect(screen.getByText('Admin Console')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Missing')).toBeInTheDocument();
    });
  });
});

describe('UI Tests: FileUploader', () => {
  it('renders upload instructions', () => {
    const mockOnFilesSelected = vi.fn();
    render(<FileUploader onFilesSelected={mockOnFilesSelected} />);
    
    expect(screen.getByText('Drag & Drop project files')).toBeInTheDocument();
  });
});
