// src/app/app.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home-stub',
  standalone: true,
  template: `<h1>Hola Mundo</h1>`
})
class HomeStub {}

describe('App (routing)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, HomeStub],
      providers: [
        // Ruta raíz que renderiza el stub con el texto esperado
        provideRouter([{ path: '', component: HomeStub }]),
      ],
    }).compileComponents();
  });

  it('should render "Hola Mundo"', async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(App);

    await router.navigateByUrl('/');     // navega a la raíz
    await fixture.whenStable();          // espera a que cargue la vista
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent ?? '').toContain('Hola Mundo');
  });
});
