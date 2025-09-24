import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Problem } from '../models/models';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProblemService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getProblems(): Observable<Problem[]> {
    return this.http.get<Problem[]>(`${this.apiUrl}/api/problems`);
  }

  seedProblems(): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/problems/seed`, {});
  }
}