import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Progress } from '../models/models';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getProgress(): Observable<Progress[]> {
    return this.http.get<Progress[]>(`${this.apiUrl}/api/progress`);
  }

  updateProgress(problemId: string, data: any ): Observable<Progress[]> {
    return this.http.post<Progress[]>(`${this.apiUrl}/api/progress/${problemId}`, data);
  }
  userProgess(userId:any){
    return this.http.get(`${this.apiUrl}/api/progress/detailed/${userId}`)
  }
}