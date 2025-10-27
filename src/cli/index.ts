#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import Table from 'cli-table3';
import { baliCostsService } from '../services/bali-costs';
import { currencyService } from '../services/currency';
import { exportService } from '../services/export';
import fs from 'fs';
import path from 'path';

const program = new Command();

program
  .name('bali-finance-cli')
  .description('CLI Tool für Bali Finanzplanung mit Haustier-Unterstützung')
  .version('1.0.0');

// Interactive planning command
program
  .command('plan')
  .description('Interaktiver Finanzplan für Bali')
  .action(async () => {
    console.log(chalk.blue.bold('🏝️  Bali Finance Planner CLI - Premium Edition'));
    console.log(chalk.gray('Planen Sie Ihre Lebenskosten auf Bali - inklusive Haustiere!\n'));

    try {
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'lifestyleLevel',
          message: 'Wählen Sie Ihr Lifestyle Level:',
          choices: [
            { name: '🌴 Budget (€620-€800/Monat)', value: 'budget' },
            { name: '🏝️ Comfort (€800-€1.200/Monat)', value: 'comfort' },
            { name: '🌺 Premium (€1.200-€2.000/Monat)', value: 'premium' },
          ],
        },
        {
          type: 'number',
          name: 'duration',
          message: 'Aufenthaltsdauer in Tagen:',
          default: 30,
          validate: (input) => input > 0 && input <= 365 || 'Bitte geben Sie eine gültige Dauer (1-365 Tage) an',
        },
        {
          type: 'number',
          name: 'persons',
          message: 'Anzahl Personen:',
          default: 1,
          validate: (input) => input > 0 && input <= 10 || 'Bitte geben Sie eine gültige Anzahl (1-10 Personen) an',
        },
        {
          type: 'confirm',
          name: 'hasPets',
          message: 'Haben Sie Haustiere?',
          default: false,
        },
        {
          type: 'number',
          name: 'pets',
          message: 'Anzahl Haustiere:',
          default: 0,
          when: (answers) => answers.hasPets,
          validate: (input) => input >= 0 && input <= 5 || 'Bitte geben Sie eine gültige Anzahl (0-5 Haustiere) an',
        },
        {
          type: 'confirm',
          name: 'hasDog',
          message: 'Haben Sie einen Hund (benötigt spezielle Pflege & Impfungen)?',
          default: false,
          when: (answers) => answers.hasPets && answers.pets > 0,
        },
        {
          type: 'list',
          name: 'season',
          message: 'Wann reisen Sie?',
          choices: [
            { name: '☀️ Trockenzeit (April-Oktober)', value: 'dry' },
            { name: '🌧️ Regenzeit (November-März)', value: 'rainy' },
            { name: '🌊 Hauptsaison (Juli-August, Dezember)', value: 'peak' },
            { name: '🌿 Nebensaison (Februar-März, Oktober)', value: 'low' },
          ],
        },
        {
          type: 'confirm',
          name: 'addCustom',
          message: 'Möchten Sie benutzerdefinierte Kosten hinzufügen?',
          default: false,
        },
      ]);

      let customCategories = [];
      if (answers.addCustom) {
        const customAnswers = await inquirer.prompt([
          {
            type: 'input',
            name: 'customName',
            message: 'Name der benutzerdefinierten Kategorie:',
          },
          {
            type: 'number',
            name: 'customAmount',
            message: 'Monatlicher Betrag in IDR:',
            validate: (input) => input > 0 || 'Betrag muss größer als 0 sein',
          },
        ]);
        
        customCategories.push({
          name: customAnswers.customName,
          amount: customAnswers.customAmount,
        });
      }

      console.log(chalk.yellow('\n📊 Berechne Finanzplan...'));
      
      const plan = await baliCostsService.calculatePlan({
        lifestyleLevel: answers.lifestyleLevel,
        duration: answers.duration,
        persons: answers.persons,
        pets: answers.pets || 0,
        hasDog: answers.hasDog || false,
        customCategories,
      });

      // Display results
      console.log(chalk.green.bold('\n✅ Finanzplan erstellt!\n'));
      
      // Summary table
      const summaryTable = new Table({
        head: [chalk.bold('Parameter'), chalk.bold('Wert')],
        colWidths: [25, 25],
      });
      
      summaryTable.push(
        ['Lifestyle', plan.lifestyleLevel],
        ['Dauer', `${plan.duration} Tage`],
        ['Personen', plan.persons.toString()],
        ['Haustiere', plan.pets.toString()],
        ['Hund', plan.hasDog ? 'Ja' : 'Nein'],
        ['Wechselkurs', `1 EUR = ${plan.exchangeRate} IDR`],
        [chalk.bold('Gesamtkosten (EUR)'), chalk.bold(`€${plan.totalCostEUR.toFixed(2)}`)],
        [chalk.bold('Gesamtkosten (IDR)'), chalk.bold(plan.totalCostIDR.toLocaleString())],
        ['Monatlich (EUR)', `€${(plan.totalCostEUR / (plan.duration / 30)).toFixed(2)}`],
        ['Monatlich (IDR)', (plan.totalCostIDR / (plan.duration / 30)).toLocaleString()],
      );
      
      console.log(summaryTable.toString());

      // Pet details if any
      if (plan.pets > 0) {
        console.log(chalk.blue.bold('\n🐕 Haustier-Kosten Details:\n'));
        
        const petTable = new Table({
          head: [chalk.bold('Kategorie'), chalk.bold('Monatlich (EUR)'), chalk.bold('Monatlich (IDR)')],
          colWidths: [20, 15, 20],
        });
        
        petTable.push(
          ['Futter', `€${plan.petDetails.food.eur.toFixed(2)}`, plan.petDetails.food.idr.toLocaleString()],
          ['Tierarzt', `€${plan.petDetails.vet.eur.toFixed(2)}`, plan.petDetails.vet.idr.toLocaleString()],
          ['Pflege', `€${plan.petDetails.grooming.eur.toFixed(2)}`, plan.petDetails.grooming.idr.toLocaleString()],
          ['Versicherung', `€${plan.petDetails.insurance.eur.toFixed(2)}`, plan.petDetails.insurance.idr.toLocaleString()],
          ['Import (amortisiert)', `€${plan.petDetails.import.eur.toFixed(2)}`, plan.petDetails.import.idr.toLocaleString()],
        );
        
        console.log(petTable.toString());
      }

      // Categories table
      console.log(chalk.blue.bold('\n📋 Detaillierte Kosten:\n'));
      
      const categoriesTable = new Table({
        head: [
          chalk.bold('Kategorie'),
          chalk.bold('Beschreibung'),
          chalk.bold('Monatlich (EUR)'),
          chalk.bold('Monatlich (IDR)'),
        ],
        colWidths: [15, 30, 15, 20],
      });
      
      plan.categories.forEach(cat => {
        categoriesTable.push([
          cat.category,
          cat.description,
          `€${cat.monthlyEUR.toFixed(2)}`,
          cat.monthlyIDR.toLocaleString(),
        ]);
      });
      
      console.log(categoriesTable.toString());

      // Seasonal variations
      console.log(chalk.blue.bold('\n📅 Saisonale Variationen:\n'));
      
      const seasonalTable = new Table({
        head: [chalk.bold('Saison'), chalk.bold('Gesamtkosten (EUR)')],
        colWidths: [20, 20],
      });
      
      seasonalTable.push(
        ['Trockenzeit', `€${plan.seasonalVariations.drySeason.toFixed(2)}`],
        ['Regenzeit (+10%)', `€${plan.seasonalVariations.rainySeason.toFixed(2)}`],
        ['Hauptsaison (+30%)', `€${plan.seasonalVariations.peakSeason.toFixed(2)}`],
        ['Nebensaison (-10%)', `€${plan.seasonalVariations.lowSeason.toFixed(2)}`],
      );
      
      console.log(seasonalTable.toString());

      // Export options
      const exportAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'export',
          message: 'Exportieren Sie den Finanzplan:',
          choices: [
            { name: '📊 Excel (.xlsx)', value: 'excel' },
            { name: '📄 PDF', value: 'pdf' },
            { name: '❌ Kein Export', value: 'none' },
          ],
        },
      ]);

      if (exportAnswer.export !== 'none') {
        const filename = `bali-financial-plan-${Date.now()}.${exportAnswer.export === 'excel' ? 'xlsx' : 'pdf'}`;
        const buffer = exportAnswer.export === 'excel' 
          ? await exportService.exportToExcel(plan)
          : await exportService.exportToPDF(plan);
        
        fs.writeFileSync(filename, buffer);
        console.log(chalk.green(`\n📁 Exportiert als: ${filename}`));
      }

    } catch (error) {
      console.error(chalk.red('❌ Fehler bei der Berechnung:'), error);
    }
  });

// Quick calculation command
program
  .command('quick')
  .description('Schnelle Berechnung mit Standardwerten')
  .option('-l, --lifestyle <level>', 'Lifestyle Level (budget|comfort|premium)', 'comfort')
  .option('-d, --duration <days>', 'Dauer in Tagen', '30')
  .option('-p, --persons <count>', 'Anzahl Personen', '1')
  .option('-t, --pets <count>', 'Anzahl Haustiere', '0')
  .option('--dog', 'Hund vorhanden?', false)
  .action(async (options) => {
    try {
      console.log(chalk.blue('🚀 Schnelle Berechnung...'));
      
      const plan = await baliCostsService.calculatePlan({
        lifestyleLevel: options.lifestyle,
        duration: parseInt(options.duration),
        persons: parseInt(options.persons),
        pets: parseInt(options.pets),
        hasDog: options.dog,
      });

      console.log(chalk.green('\n💰 Ergebnis:'));
      console.log(`Lifestyle: ${plan.lifestyleLevel}`);
      console.log(`Dauer: ${plan.duration} Tage`);
      console.log(`Personen: ${plan.persons}`);
      console.log(`Haustiere: ${plan.pets}`);
      console.log(`Hund: ${plan.hasDog ? 'Ja' : 'Nein'}`);
      console.log(`${chalk.bold('Gesamtkosten:')} €${plan.totalCostEUR.toFixed(2)} (${plan.totalCostIDR.toLocaleString()} IDR)`);
      console.log(`${chalk.bold('Monatlich:')} €${(plan.totalCostEUR / (plan.duration / 30)).toFixed(2)} (${(plan.totalCostIDR / (plan.duration / 30)).toLocaleString()} IDR)`);
      
      if (plan.pets > 0) {
        console.log(chalk.blue('\n🐕 Haustier-Kosten:'));
        console.log(`Futter: €${plan.petDetails.food.eur.toFixed(2)}/Monat`);
        console.log(`Tierarzt: €${plan.petDetails.vet.eur.toFixed(2)}/Monat`);
        console.log(`Pflege: €${plan.petDetails.grooming.eur.toFixed(2)}/Monat`);
        console.log(`Versicherung: €${plan.petDetails.insurance.eur.toFixed(2)}/Monat`);
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Fehler:'), error);
    }
  });

// Pet cost calculator command
program
  .command('pet')
  .description('Haustier-Kosten-Rechner')
  .action(async () => {
    try {
      console.log(chalk.blue.bold('🐕 Haustier-Kosten-Rechner für Bali\n'));
      
      const answers = await inquirer.prompt([
        {
          type: 'number',
          name: 'pets',
          message: 'Anzahl Haustiere:',
          default: 1,
          validate: (input) => input > 0 && input <= 5 || 'Bitte geben Sie eine gültige Anzahl (1-5 Haustiere) an',
        },
        {
          type: 'confirm',
          name: 'hasDog',
          message: 'Sind es Hunde?',
          default: true,
        },
      ]);

      const exchangeRate = await currencyService.getExchangeRate('EUR', 'IDR');
      const petCosts = baliCostsService.calculatePetCosts(answers.pets, answers.hasDog, exchangeRate);
      
      const petTable = new Table({
        head: [chalk.bold('Kategorie'), chalk.bold('Monatlich (EUR)'), chalk.bold('Monatlich (IDR)'), chalk.bold('Jährlich (EUR)'), chalk.bold('Jährlich (IDR)')],
        colWidths: [15, 15, 20, 15, 20],
      });
      
      const totalMonthlyEUR = Object.values(petCosts).reduce((sum, cost) => sum + cost.eur, 0);
      const totalMonthlyIDR = Object.values(petCosts).reduce((sum, cost) => sum + cost.idr, 0);
      
      petTable.push(
        ['Futter', `€${petCosts.food.eur.toFixed(2)}`, petCosts.food.idr.toLocaleString(), `€${(petCosts.food.eur * 12).toFixed(2)}`, (petCosts.food.idr * 12).toLocaleString()],
        ['Tierarzt', `€${petCosts.vet.eur.toFixed(2)}`, petCosts.vet.idr.toLocaleString(), `€${(petCosts.vet.eur * 12).toFixed(2)}`, (petCosts.vet.idr * 12).toLocaleString()],
        ['Pflege', `€${petCosts.grooming.eur.toFixed(2)}`, petCosts.grooming.idr.toLocaleString(), `€${(petCosts.grooming.eur * 12).toFixed(2)}`, (petCosts.grooming.idr * 12).toLocaleString()],
        ['Versicherung', `€${petCosts.insurance.eur.toFixed(2)}`, petCosts.insurance.idr.toLocaleString(), `€${(petCosts.insurance.eur * 12).toFixed(2)}`, (petCosts.insurance.idr * 12).toLocaleString()],
        ['Import (amortisiert)', `€${petCosts.import.eur.toFixed(2)}`, petCosts.import.idr.toLocaleString(), `€${(petCosts.import.eur * 12).toFixed(2)}`, (petCosts.import.idr * 12).toLocaleString()],
        [chalk.bold('GESAMT'), chalk.bold(`€${totalMonthlyEUR.toFixed(2)}`), chalk.bold(totalMonthlyIDR.toLocaleString()), chalk.bold(`€${(totalMonthlyEUR * 12).toFixed(2)}`), chalk.bold((totalMonthlyIDR * 12).toLocaleString())],
      );
      
      console.log(petTable.toString());
      
      console.log(chalk.green(`\n💡 Tipp: Haustiere sind auf Bali willkommen! Viele Villas erlauben Haustiere, und es gibt gute Tierärzte in den Touristengebieten.`));
      
    } catch (error) {
      console.error(chalk.red('❌ Fehler:'), error);
    }
  });

// Exchange rate command
program
  .command('rate')
  .description('Aktuellen Wechselkurs abrufen')
  .option('-f, --from <currency>', 'Von Währung', 'EUR')
  .option('-t, --to <currency>', 'Zu Währung', 'IDR')
  .action(async (options) => {
    try {
      const rate = await currencyService.getExchangeRate(options.from.toUpperCase(), options.to.toUpperCase());
      
      console.log(chalk.blue('💱 Wechselkurs:'));
      console.log(`1 ${options.from.toUpperCase()} = ${rate.toLocaleString()} ${options.to.toUpperCase()}`);
      console.log(`Stand: ${new Date().toLocaleString('de-DE')}`);
      
    } catch (error) {
      console.error(chalk.red('❌ Fehler beim Abrufen des Wechselkurses:'), error);
    }
  });

// Initialize command
program
  .command('init')
  .description('Datenbank initialisieren')
  .action(async () => {
    try {
      console.log(chalk.blue('🔧 Initialisiere Datenbank...'));
      const { initDb } = await import('../lib/db');
      await initDb();
      console.log(chalk.green('✅ Datenbank erfolgreich initialisiert!'));
    } catch (error) {
      console.error(chalk.red('❌ Initialisierung fehlgeschlagen:'), error);
    }
  });

program.parse();