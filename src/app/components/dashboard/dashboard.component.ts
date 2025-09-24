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

  constructor(
    private problemService: ProblemService,
    private progressService: ProgressService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    
    // Load problems
    this.problemService.getProblems().subscribe({
      next: (problems) => {
        this.problems = problems;
        this.extractChapters();
        this.calculateStats();
        
        // Load progress
        this.progressService.getProgress().subscribe({
          next: (progress) => {
            this.progress = progress;
            this.calculateStats();
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          }
        });
      },
      error: () => {
        // If no problems, seed them
        this.problemService.seedProblems().subscribe(() => {
          this.loadData();
        });
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
    const progressItem = this.progress.find(p => p.problemId === problemId);
    return progressItem?.completed || false;
  }

  toggleProgress(problemId: string): void {
    const isCompleted = !this.isCompleted(problemId);
    
    this.progressService.updateProgress(problemId, isCompleted).subscribe({
      next: (updatedProgress) => {
        this.progress = updatedProgress;
        this.calculateStats();
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
