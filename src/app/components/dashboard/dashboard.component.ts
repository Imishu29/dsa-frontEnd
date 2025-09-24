import { Component, OnInit } from '@angular/core';
import { ProblemService } from '../../services/problem.service';
import { ProgressService } from '../../services/progress.service';
import { Problem, Progress } from '../../models/models';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NavbarComponent , CommonModule , ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  problems: Problem[] = [];
  progress: Progress[] = [];
  chapters: string[] = [];
  selectedChapter = '';
  loading = true;
  stats = {
    total: 0,
    completed: 0,
    easy: { total: 0, completed: 0 },
    medium: { total: 0, completed: 0 },
    hard: { total: 0, completed: 0 }
  };
  id:any;
  userID:any;

  constructor(
    private problemService: ProblemService,
    private progressService: ProgressService
  ) { }

  ngOnInit(): void {
    this.id = localStorage.getItem('currentUser')
    this.userID = JSON.parse(this.id)
    if (this.userID) {
      this.loadData();
    }
  }

  loadData(): void {
    this.loading = true;
    
    // Load problems first
    this.problemService.getProblems().subscribe({
      next: (problems) => {
        this.problems = problems;
        this.extractChapters();
        
        // Then load user progress
        this.loadUserProgress();
      },
      error: () => {
        // If no problems, seed them
        this.problemService.seedProblems().subscribe(() => {
          this.loadData();
        });
      }
    });
  }

  loadUserProgress(): void {
    this.progressService.userProgess(this.userID.id).subscribe({
      next: (resp: any) => {
        console.log('User Progress Response:', resp);
        
        // Map the progress from response
        if (resp && resp.progress) {
          this.progress = resp.progress.map((item: any) => ({
            problemId: item.problemId._id, // Use the actual problem ID
            completed: item.completed,
            completedAt: item.completedAt,
            _id: item._id
          }));
        }
        
        // Update stats if statistics are provided
        if (resp.statistics) {
          console.log('Statistics:', resp.statistics);
        }
        
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user progress:', error);
        this.loading = false;
      }
    });
  }

  extractChapters(): void {
    const chapterSet = new Set(this.problems.map(p => p.chapter));
    this.chapters = Array.from(chapterSet);
  }

  calculateStats(): void {
    this.stats.total = this.problems.length;
    this.stats.completed = this.progress.filter(p => p.completed).length;
    
    // Reset level stats
    this.stats.easy = { total: 0, completed: 0 };
    this.stats.medium = { total: 0, completed: 0 };
    this.stats.hard = { total: 0, completed: 0 };
    
    this.problems.forEach(problem => {
      const levelKey = problem.level.toLowerCase() as 'easy' | 'medium' | 'hard';
      this.stats[levelKey].total++;
      
      const isCompleted = this.isCompleted(problem._id);
      if (isCompleted) {
        this.stats[levelKey].completed++;
      }
    });
  }

  getFilteredProblems(): Problem[] {
    if (!this.selectedChapter) {
      return this.problems;
    }
    return this.problems.filter(p => p.chapter === this.selectedChapter);
  }

  isCompleted(problemId: string): boolean {
    // Check if problemId exists in progress array
    const progressItem = this.progress.find(p => 
      p.problemId === problemId || p.problemId === problemId
    );
    return progressItem?.completed || false;
  }

  toggleProgress(problemId: string): void {
    const isCompleted = !this.isCompleted(problemId);
    console.log('Toggling problem:', problemId, 'to:', isCompleted);
    
    this.progressService.updateProgress(problemId, { 
      completed: isCompleted, 
      user: this.userID.id 
    }).subscribe({
      next: (updatedProgress) => {
        console.log('Updated Progress:', updatedProgress);
        
        // Update local progress array
        this.progress = updatedProgress.map((item: any) => ({
          problemId: typeof item.problemId === 'object' ? item.problemId._id : item.problemId,
          completed: item.completed,
          completedAt: item.completedAt,
          _id: item._id
        }));
        
        this.calculateStats();
      },
      error: (error) => {
        console.error('Error updating progress:', error);
      }
    });
  }

  getProgressPercentage(): number {
    if (this.stats.total === 0) return 0;
    return Math.round((this.stats.completed / this.stats.total) * 100);
  }

  getLevelProgressPercentage(level: 'easy' | 'medium' | 'hard'): number {
    if (this.stats[level].total === 0) return 0;
    return Math.round((this.stats[level].completed / this.stats[level].total) * 100);
  }
}