import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function analyzeIssues() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔍 Analyse des incohérences restantes...\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Récupérer tous les langages
    const allLangages = await langageModel.find().exec();

    // Grouper les problèmes par catégorie
    const issues = {
      withVPrefix: [] as any[],
      withOtherPrefix: [] as any[],
      logicalInconsistency: [] as any[],
      suspiciousVersion: [] as any[]
    };

    for (const lang of allLangages) {
      const versions = lang.versions || [];

      for (const v of versions) {
        const label = v.label;

        // Vérifier les préfixes "v"
        if (/^v\d/.test(label)) {
          issues.withVPrefix.push({ name: lang.name, type: v.type, label });
        }

        // Vérifier autres préfixes non normalisés
        if (/^(php-|swift-|docker-|bun-|ocaml-)/.test(label)) {
          issues.withOtherPrefix.push({ name: lang.name, type: v.type, label });
        }

        // Vérifier versions suspectes (majeure > 100 sans pattern année)
        if (!/^\d{4}/.test(label)) {
          const match = label.match(/^(\d+)/);
          if (match && parseInt(match[1]) > 100) {
            issues.suspiciousVersion.push({ name: lang.name, type: v.type, label });
          }
        }
      }

      // Vérifier incohérences logiques (current < lts)
      const current = versions.find(v => v.type === 'current');
      const lts = versions.find(v => v.type === 'lts');

      if (current && lts) {
        const currentNum = parseFloat(current.label);
        const ltsNum = parseFloat(lts.label);

        if (!isNaN(currentNum) && !isNaN(ltsNum) && currentNum < ltsNum) {
          issues.logicalInconsistency.push({
            name: lang.name,
            current: current.label,
            lts: lts.label
          });
        }
      }
    }

    // Afficher les résultats
    console.log('📋 VERSIONS AVEC PRÉFIXE "v"');
    console.log('─────────────────────────────────────────────────────────');
    if (issues.withVPrefix.length > 0) {
      issues.withVPrefix.forEach(issue => {
        console.log(`  ${issue.name} (${issue.type}): ${issue.label}`);
      });
    } else {
      console.log('  ✅ Aucune version avec préfixe "v"');
    }

    console.log('\n📋 VERSIONS AVEC AUTRES PRÉFIXES');
    console.log('─────────────────────────────────────────────────────────');
    if (issues.withOtherPrefix.length > 0) {
      issues.withOtherPrefix.forEach(issue => {
        console.log(`  ${issue.name} (${issue.type}): ${issue.label}`);
      });
    } else {
      console.log('  ✅ Aucune version avec préfixe non normalisé');
    }

    console.log('\n⚠️  INCOHÉRENCES LOGIQUES (current < lts)');
    console.log('─────────────────────────────────────────────────────────');
    if (issues.logicalInconsistency.length > 0) {
      issues.logicalInconsistency.forEach(issue => {
        console.log(`  ${issue.name}: current=${issue.current} < lts=${issue.lts}`);
      });
      console.log('\n  📌 Ces cas nécessitent une investigation manuelle:');
      for (const issue of issues.logicalInconsistency) {
        console.log(`\n  ${issue.name}:`);

        switch (issue.name) {
          case 'Ansible':
            console.log('    → Ansible a deux repos: ansible (package) et ansible-core');
            console.log('    → ansible package: v7.x.x (contient ansible-core 2.14)');
            console.log('    → ansible-core: v2.x.x (le moteur)');
            console.log('    → Solution: Décider quel repo suivre');
            break;

          case 'C#':
            console.log('    → Confusion entre .NET Runtime (v10.0.0) et C# Language (v12.0)');
            console.log('    → Ce sont deux choses différentes');
            console.log('    → Solution: Suivre la version du langage C# uniquement');
            break;

          default:
            console.log('    → Investigation manuelle nécessaire');
        }
      }
    } else {
      console.log('  ✅ Aucune incohérence logique détectée');
    }

    console.log('\n🔢 VERSIONS SUSPECTES (majeure > 100)');
    console.log('─────────────────────────────────────────────────────────');
    if (issues.suspiciousVersion.length > 0) {
      issues.suspiciousVersion.forEach(issue => {
        console.log(`  ${issue.name} (${issue.type}): ${issue.label}`);
      });
      console.log('\n  📌 Analyse des cas:');

      const grouped = issues.suspiciousVersion.reduce((acc, issue) => {
        if (!acc[issue.name]) acc[issue.name] = [];
        acc[issue.name].push(issue);
        return acc;
      }, {} as Record<string, any[]>);

      for (const [name, versions] of Object.entries(grouped)) {
        console.log(`\n  ${name}:`);
        (versions as any[]).forEach(v => console.log(`    ${v.type}: ${v.label}`));

        switch (name) {
          case 'MATLAB':
            console.log('    → Format valide: R2025a = 2025.1, R2025b = 2025.2');
            console.log('    → Pas d\'erreur, c\'est le format officiel');
            break;

          case 'Unity':
            console.log('    → Format valide: 2019.4.40f1 (année.majeure.mineure)');
            console.log('    → Pas d\'erreur, c\'est le format officiel');
            break;

          case 'SQL':
            console.log('    → Format: SQL:2023 (année du standard)');
            console.log('    → Pas d\'erreur, c\'est le format officiel');
            break;

          default:
            console.log('    → Vérification manuelle recommandée');
        }
      }
    } else {
      console.log('  ✅ Aucune version suspecte');
    }

    console.log('\n\n📊 RÉSUMÉ');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Versions avec préfixe "v": ${issues.withVPrefix.length}`);
    console.log(`Versions avec autres préfixes: ${issues.withOtherPrefix.length}`);
    console.log(`Incohérences logiques: ${issues.logicalInconsistency.length}`);
    console.log(`Versions suspectes: ${issues.suspiciousVersion.length}`);

  } finally {
    await app.close();
  }
}

analyzeIssues().catch(error => {
  console.error('❌ Erreur lors de l\'analyse:', error);
  process.exit(1);
});
