import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function checkSupportDurationAnomalies() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔍 VÉRIFICATION DES SUPPORT DURATION (en mois)\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Récupérer tous les langages avec des versions
    const langages = await langageModel.find({}).exec();

    const anomalies: any[] = [];
    const valid: any[] = [];

    for (const lang of langages) {
      if (!lang.versions || lang.versions.length === 0) continue;

      for (const version of lang.versions) {
        if (version.supportDuration !== undefined && version.supportDuration !== null) {
          const duration = version.supportDuration;
          const type = typeof duration;

          // Vérifier les anomalies
          let issue: string | null = null;

          if (type !== 'number') {
            issue = `Type invalide: ${type} (valeur: ${duration})`;
          } else if (duration < 0) {
            issue = `Valeur négative: ${duration}`;
          } else if (duration > 120) {
            issue = `Valeur trop élevée (>10 ans): ${duration} mois`;
          } else if (!Number.isInteger(duration) && duration % 0.5 !== 0) {
            issue = `Valeur non entière suspecte: ${duration}`;
          } else if (duration === 0) {
            issue = `Valeur zéro`;
          }

          const entry = {
            name: lang.name,
            versionType: version.type,
            label: version.label,
            supportDuration: duration,
            typeOf: type
          };

          if (issue) {
            anomalies.push({ ...entry, issue });
          } else {
            valid.push(entry);
          }
        }
      }
    }

    // Afficher les résultats valides
    console.log('✅ VALEURS VALIDES:');
    console.log('─────────────────────────────────────────────────────────\n');

    // Grouper par durée pour voir la distribution
    const byDuration = new Map<number, any[]>();
    valid.forEach(v => {
      const key = v.supportDuration;
      if (!byDuration.has(key)) byDuration.set(key, []);
      byDuration.get(key)!.push(v);
    });

    const sortedDurations = Array.from(byDuration.keys()).sort((a, b) => a - b);
    for (const duration of sortedDurations) {
      const items = byDuration.get(duration)!;
      console.log(`${duration} mois (${(duration / 12).toFixed(1)} ans):`);
      items.forEach(item => {
        console.log(`  • ${item.name} (${item.versionType})`);
      });
      console.log('');
    }

    // Afficher les anomalies
    if (anomalies.length > 0) {
      console.log('\n❌ ANOMALIES DÉTECTÉES:');
      console.log('─────────────────────────────────────────────────────────\n');

      anomalies.forEach(a => {
        console.log(`• ${a.name} (${a.versionType}): ${a.supportDuration}`);
        console.log(`  Issue: ${a.issue}`);
        console.log('');
      });
    } else {
      console.log('\n✅ Aucune anomalie détectée!');
    }

    console.log('\n📊 RÉSUMÉ:');
    console.log(`  • Valeurs valides: ${valid.length}`);
    console.log(`  • Anomalies: ${anomalies.length}`);

  } finally {
    await app.close();
  }
}

checkSupportDurationAnomalies().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
