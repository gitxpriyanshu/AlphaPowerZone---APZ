import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface FitnessReportData {
  userName: string;
  generatedAt: Date;
  userInput: {
    height_cm: number;
    weight_kg: number;
    age: number;
    gender: string;
    goal: string;
    workout_days_per_week: number;
    diet_type: string;
    fitness_experience: string;
  };
  metrics: {
    bmi: number;
    bmi_category: string;
    calories_target: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    ideal_weight_range: [number, number];
    bmr: number;
    tdee: number;
  };
  plan: {
    workout_plan: {
      weekly_schedule: Array<{
        day: string;
        focus: string;
        exercises: Array<{
          name: string;
          sets: number;
          reps: string;
          rest: string;
        }>;
      }>;
    };
    diet_plan: {
      daily_meals: Array<{
        meal: string;
        time: string;
        options: string[];
        calories: number;
      }>;
      foods_to_eat: string[];
      foods_to_avoid: string[];
    };
    supplements: Array<{
      name: string;
      purpose: string;
      dosage: string;
      timing: string;
      priority: 'essential' | 'recommended' | 'optional';
    }>;
    lifestyle_tips: string[];
  };
}

// Draw the header bar on a page
function drawHeaderBar(doc: jsPDF, pageNumber: number, totalPages: number, subtitle?: string) {
  const isPageOne = pageNumber === 1;
  const height = isPageOne ? 28 : 15;

  // Background fill: #1a1408 (dark warm brand color)
  doc.setFillColor(26, 20, 8);
  doc.rect(0, 0, 210, height, 'F');

  // Left logo: Text "APZ" in bold, brand gold (#C8A96E)
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(200, 169, 110);
  
  if (isPageOne) {
    doc.setFontSize(22);
    doc.text("APZ", 15, 18);
    
    // Right text: "ALPHAPOWERZONE.COM"
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text("ALPHAPOWERZONE.COM", 195, 16, { align: 'right' });
  } else {
    doc.setFontSize(14);
    doc.text("APZ", 15, 10);

    // Center header subtitle
    if (subtitle) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(subtitle.toUpperCase(), 105, 10, { align: 'center' });
    }

    // Right page tracker
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`PAGE ${pageNumber} OF ${totalPages}`, 195, 10, { align: 'right' });
  }

  // Thin gold boundary line below header (1pt, #C8A96E)
  doc.setDrawColor(200, 169, 110);
  doc.setLineWidth(0.35);
  doc.line(0, height, 210, height);
}

// Draw the footer on a page
function drawFooter(doc: jsPDF, pageNumber: number, totalPages: number, userName: string) {
  const y = 282;

  // Thin grey footer line (0.5pt, #E4E4E7)
  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.176);
  doc.line(15, y - 2, 195, y - 2);

  // Left: Copyright
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(136, 136, 136);
  doc.text("© 2026 AlphaPowerZone. All rights reserved.", 15, y + 2);

  // Center: Personalization tag
  doc.setFont('helvetica', 'italic');
  doc.text(`This report is personalized for ${userName} only.`, 105, y + 2, { align: 'center' });

  // Right: Page numbers
  doc.setFont('helvetica', 'normal');
  doc.text(`Page ${pageNumber} of ${totalPages}`, 195, y + 2, { align: 'right' });

  // Bottom Center URL and support details
  doc.setFontSize(6);
  doc.setTextColor(200, 169, 110);
  doc.text("ALPHAPOWERZONE.COM | SUPPORT@ALPHAPOWERZONE.COM", 105, y + 6, { align: 'center' });
}

// Draw rounded metric boxes
function drawMetricBox(
  doc: jsPDF, 
  x: number, 
  y: number, 
  label: string, 
  value: string, 
  category: string, 
  categoryColor: { r: number, g: number, b: number }
) {
  // Outer rectangle with rounded corners (1pt border, #E4E4E7)
  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.35);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, y, 86, 26, 2, 2, 'FD');

  // Top-left micro-label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(136, 136, 136);
  doc.text(label.toUpperCase(), x + 4, y + 5);

  // Large value text
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(9, 9, 11);
  doc.text(value, x + 4, y + 14);

  // Sub-category line below
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(categoryColor.r, categoryColor.g, categoryColor.b);
  doc.text(category.toUpperCase(), x + 4, y + 21);
}

export function generateFitnessReport(data: FitnessReportData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // ==================== PAGE 1: COVER & HEALTH METRICS ====================
  let y = 43; // 28mm header + 15mm top spacing

  // Report title block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(136, 136, 136);
  doc.text("PERSONALIZED ELITE BLUEPRINT", 15, y);

  y += 8;
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(9, 9, 11);
  doc.text("FITNESS INTELLIGENCE REPORT", 15, y);

  y += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(82, 82, 91);
  doc.text(`Prepared for: ${data.userName}`, 15, y);

  y += 5;
  doc.setFontSize(9);
  doc.setTextColor(136, 136, 136);
  const formattedDate = data.generatedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Generated: ${formattedDate}`, 15, y);

  y += 4;
  // Gold divider line (0.5pt, #C8A96E)
  doc.setDrawColor(200, 169, 110);
  doc.setLineWidth(0.176);
  doc.line(15, y, 195, y);

  // User summary bar
  y += 4;
  doc.setFillColor(244, 244, 245);
  doc.rect(15, y, 180, 18, 'F');

  // Summary labels & values
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(136, 136, 136);
  doc.text("HEIGHT", 20, y + 5);
  doc.text("WEIGHT", 65, y + 5);
  doc.text("AGE", 110, y + 5);
  doc.text("GENDER", 155, y + 5);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(9, 9, 11);
  doc.text(`${data.userInput.height_cm} cm`, 20, y + 9);
  doc.text(`${data.userInput.weight_kg} kg`, 65, y + 9);
  doc.text(`${data.userInput.age} yrs`, 110, y + 9);
  doc.text(data.userInput.gender.toUpperCase(), 155, y + 9);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(136, 136, 136);
  doc.text("GOAL", 20, y + 13);
  doc.text("EXPERIENCE", 65, y + 13);
  doc.text("DIET TYPE", 110, y + 13);
  doc.text("WORKOUT DAYS", 155, y + 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(9, 9, 11);
  const goalStr = data.userInput.goal.replace('_', ' ').toUpperCase();
  const expStr = data.userInput.fitness_experience.replace('_', ' ').toUpperCase();
  const dietStrInput = data.userInput.diet_type.replace('_', ' ').toUpperCase();
  doc.text(goalStr, 20, y + 17);
  doc.text(expStr, 65, y + 17);
  doc.text(dietStrInput, 110, y + 17);
  doc.text(`${data.userInput.workout_days_per_week} days/wk`, 155, y + 17);

  y += 22; // Start grid

  // 2x2 health boxes
  const bmiCategory = data.metrics.bmi_category.toLowerCase();
  const bmiColor = bmiCategory === 'normal'
    ? { r: 22, g: 163, b: 74 }      // Green
    : bmiCategory === 'overweight'
      ? { r: 217, g: 119, b: 6 }    // Orange
      : bmiCategory === 'underweight'
        ? { r: 96, g: 165, b: 250 }  // Blue
        : { r: 220, g: 38, b: 38 };  // Red

  drawMetricBox(doc, 15, y, "BMI Score", data.metrics.bmi.toFixed(2), data.metrics.bmi_category, bmiColor);
  drawMetricBox(doc, 109, y, "Calorie Target", `${Math.round(data.metrics.calories_target)} KCAL`, "DAILY INTAKE", { r: 200, g: 169, b: 110 });

  drawMetricBox(doc, 15, y + 30, "Protein Goal", `${data.metrics.protein_g}g`, "DAILY TARGET", { r: 200, g: 169, b: 110 });
  drawMetricBox(doc, 109, y + 30, "Ideal Weight Range", `${data.metrics.ideal_weight_range[0]} - ${data.metrics.ideal_weight_range[1]} kg`, "TARGET RANGE", { r: 200, g: 169, b: 110 });

  y += 62;

  // Visual BMI Scale Bar
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(136, 136, 136);
  doc.text("BODY MASS INDEX ANALYSIS SCALE", 15, y);

  y += 10;
  // Segments
  doc.setFillColor(96, 165, 250); // Underweight
  doc.rect(15, y, 45, 6, 'F');
  doc.setFillColor(22, 163, 74); // Normal
  doc.rect(60, y, 45, 6, 'F');
  doc.setFillColor(217, 119, 6); // Overweight
  doc.rect(105, y, 45, 6, 'F');
  doc.setFillColor(220, 38, 38); // Obese
  doc.rect(150, y, 45, 6, 'F');

  // Pin pointer Math: map [15 - 40] to [15mm - 195mm]
  const bmiVal = data.metrics.bmi;
  const bmiPct = Math.max(0, Math.min(1, (bmiVal - 15) / 25));
  const arrowX = 15 + bmiPct * 180;

  // Draw arrow triangle
  doc.setFillColor(9, 9, 11);
  doc.triangle(arrowX, y - 1, arrowX - 2.5, y - 4.5, arrowX + 2.5, y - 4.5, 'F');
  
  // Draw marker vertical line
  doc.setDrawColor(9, 9, 11);
  doc.setLineWidth(0.5);
  doc.line(arrowX, y, arrowX, y + 6);

  // Label score above triangle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(9, 9, 11);
  doc.text(bmiVal.toFixed(2), arrowX, y - 6, { align: 'center' });

  // Labels under segments
  doc.setFontSize(7);
  doc.setTextColor(136, 136, 136);
  doc.text("UNDERWEIGHT (<18.5)", 37.5, y + 10, { align: 'center' });
  doc.text("NORMAL (18.5-25)", 82.5, y + 10, { align: 'center' });
  doc.text("OVERWEIGHT (25-30)", 127.5, y + 10, { align: 'center' });
  doc.text("OBESE (>=30)", 172.5, y + 10, { align: 'center' });

  y += 18;

  // Caloric Macro Progress Bars
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(9, 9, 11);
  doc.text("MACRO CALORIC DISTRIBUTION", 15, y);

  const pG = data.metrics.protein_g;
  const cG = data.metrics.carbs_g;
  const fG = data.metrics.fat_g;

  const totalKcal = (pG * 4) + (cG * 4) + (fG * 9);
  const pPct = totalKcal > 0 ? Math.round((pG * 4 / totalKcal) * 100) : 30;
  const cPct = totalKcal > 0 ? Math.round((cG * 4 / totalKcal) * 100) : 40;
  const fPct = totalKcal > 0 ? (100 - pPct - cPct) : 30;

  const macros = [
    { label: "PROTEIN", grams: pG, pct: pPct, color: { r: 200, g: 169, b: 110 } }, // Gold
    { label: "CARBS", grams: cG, pct: cPct, color: { r: 9, g: 9, b: 11 } },        // Dark
    { label: "FATS", grams: fG, pct: fPct, color: { r: 161, g: 161, b: 170 } }     // Grey
  ];

  y += 4;
  macros.forEach((m) => {
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(82, 82, 91);
    doc.text(m.label, 15, y + 4.5);

    // Track Background
    doc.setFillColor(244, 244, 245);
    doc.rect(45, y, 110, 6, 'F');

    // Fill Tracker Bar
    doc.setFillColor(m.color.r, m.color.g, m.color.b);
    const fillWidth = (m.pct / 100) * 110;
    doc.rect(45, y, fillWidth, 6, 'F');

    // Stats
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(9, 9, 11);
    doc.text(`${m.grams}g / ${m.pct}%`, 160, y + 4.5);
  });

  // ==================== PAGE 2: WORKOUT SCHEDULE ====================
  doc.addPage();
  y = 25;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(9, 9, 11);
  doc.text("WEEKLY WORKOUT SCHEDULE", 15, y);
  y += 6;

  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  daysOrder.forEach((dayName) => {
    const dayPlan = data.plan.workout_plan.weekly_schedule.find(
      (d) => d.day.toLowerCase() === dayName.toLowerCase()
    );

    // If close to page edge, inject page break to avoid orphans
    if (y > 220) {
      doc.addPage();
      y = 25;
    }

    // Day label block
    doc.setFillColor(244, 244, 245);
    doc.rect(15, y, 180, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(9, 9, 11);
    doc.text(dayName.toUpperCase(), 18, y + 5.5);

    const focusText = dayPlan ? dayPlan.focus.toUpperCase() : "REST DAY / ACTIVE RECOVERY";
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(200, 169, 110); // Brand gold
    doc.text(focusText, 192, y + 5.5, { align: 'right' });

    y += 10;

    if (dayPlan && dayPlan.exercises && dayPlan.exercises.length > 0) {
      const tableBody = dayPlan.exercises.map((ex, idx) => [
        (idx + 1).toString(),
        ex.name,
        `${ex.sets} × ${ex.reps}`,
        ex.rest
      ]);

      autoTable(doc, {
        startY: y,
        margin: { left: 15, right: 15 },
        head: [['#', 'EXERCISE NAME', 'SETS × REPS', 'REST PERIOD']],
        body: tableBody,
        headStyles: {
          fillColor: [26, 20, 8],
          textColor: [200, 169, 110],
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'left'
        },
        columnStyles: {
          0: { cellWidth: 12 },
          1: { cellWidth: 98 },
          2: { cellWidth: 35 },
          3: { cellWidth: 35 }
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [9, 9, 11]
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
        styles: {
          cellPadding: 3
        }
      });

      y = (doc as any).lastAutoTable.finalY + 8;
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(136, 136, 136);
      doc.text("REST DAY — Focus on active recovery, hydration, and moderate mobility work.", 18, y);
      y += 8;
    }
  });

  // ==================== PAGE 3: NUTRITION PLAN ====================
  doc.addPage();
  y = 25;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(9, 9, 11);
  doc.text("PERFORMANCE NUTRITION PLAN", 15, y);
  y += 6;

  const mealsBody = data.plan.diet_plan.daily_meals.map((m) => [
    m.time,
    m.meal.toUpperCase(),
    m.options.join('\n'),
    `${m.calories} KCAL`
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: 15, right: 15 },
    head: [['TIME', 'MEAL', 'NUTRITIONAL OPTIONS & PREPARATIONS', 'ENERGY']],
    body: mealsBody,
    headStyles: {
      fillColor: [26, 20, 8],
      textColor: [200, 169, 110],
      fontSize: 8,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 28, fontStyle: 'bold' },
      2: { cellWidth: 105 },
      3: { cellWidth: 25, halign: 'right', fontStyle: 'bold' }
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [9, 9, 11]
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
    styles: {
      cellPadding: 3
    }
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // Foods to Eat
  doc.setLineWidth(1.0);
  doc.setDrawColor(22, 163, 74);
  doc.line(15, y, 15, y + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(22, 163, 74);
  doc.text("RECOMMENDED FOODS (FAVORED FOR PERFORMANCE & ANABOLISM)", 18, y + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(9, 9, 11);
  const eatText = data.plan.diet_plan.foods_to_eat.join(', ');
  const splitEat = doc.splitTextToSize(eatText, 175);
  doc.text(splitEat, 18, y + 9);

  y += Math.max(18, 9 + splitEat.length * 4.5) + 6;

  // Foods to Avoid
  doc.setLineWidth(1.0);
  doc.setDrawColor(220, 38, 38);
  doc.line(15, y, 15, y + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(220, 38, 38);
  doc.text("AVOID THESE FOODS (HIGHLY INFLAMMATORY / ESTROGENIC / THWARTING)", 18, y + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(9, 9, 11);
  const avoidText = data.plan.diet_plan.foods_to_avoid.join(', ');
  const splitAvoid = doc.splitTextToSize(avoidText, 175);
  doc.text(splitAvoid, 18, y + 9);

  // ==================== PAGE 4: SUPPLEMENTATION & LIFESTYLE ====================
  doc.addPage();
  y = 25;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(9, 9, 11);
  doc.text("RECOMMENDED SUPPLEMENTATION PROTOCOL", 15, y);
  y += 8;

  data.plan.supplements.forEach((sup) => {
    // Supp box height is 22mm
    if (y > 230) {
      doc.addPage();
      y = 25;
    }

    doc.setDrawColor(228, 228, 231);
    doc.setLineWidth(0.35);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15, y, 180, 22, 1.5, 1.5, 'FD');

    const priority = sup.priority.toLowerCase();
    let badgeBg = [200, 169, 110];
    let badgeFg = [255, 255, 255];
    if (priority === 'recommended') {
      badgeBg = [9, 9, 11];
    } else if (priority === 'optional') {
      badgeBg = [228, 228, 231];
      badgeFg = [82, 82, 91];
    }

    doc.setFillColor(badgeBg[0], badgeBg[1], badgeBg[2]);
    doc.rect(15, y, 32, 5, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(badgeFg[0], badgeFg[1], badgeFg[2]);
    doc.text(priority.toUpperCase(), 31, y + 3.8, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(9, 9, 11);
    doc.text(sup.name, 52, y + 6);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(82, 82, 91);
    doc.text(sup.purpose, 52, y + 10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(136, 136, 136);
    doc.text("DOSAGE", 52, y + 15);
    doc.text("TIMING", 120, y + 15);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(9, 9, 11);
    doc.text(sup.dosage, 52, y + 19);
    doc.text(sup.timing, 120, y + 19);

    doc.setDrawColor(200, 169, 110);
    doc.setLineWidth(0.25);
    doc.line(15, y + 22, 195, y + 22);

    y += 27;
  });

  // Lifestyle section on same page
  if (y > 200) {
    doc.addPage();
    y = 25;
  }

  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(9, 9, 11);
  doc.text("ELITE LIFESTYLE OPTIMIZATION TIPS", 15, y);
  y += 8;

  data.plan.lifestyle_tips.forEach((tip, idx) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(200, 169, 110);
    const numStr = (idx + 1).toString().padStart(2, '0');
    doc.text(`${numStr}.`, 15, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(82, 82, 91);
    const splitTip = doc.splitTextToSize(tip, 170);
    doc.text(splitTip, 22, y);

    y += splitTip.length * 4.5 + 3;
  });

  // ==================== GLOBAL DECORATOR OVERLAY ====================
  // Apply page numbers, branding header & footers dynamically in a second pass
  const totalPages = (doc as any).internal.getNumberOfPages() as number;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const subtitle = i === 1 ? undefined : i === 2 ? "Workout Blueprint" : i === 3 ? "Nutrition Blueprint" : "Supplements & Lifestyle";
    drawHeaderBar(doc, i, totalPages, subtitle);
    drawFooter(doc, i, totalPages, data.userName);
  }

  // Save/Download the file
  const dateSuffix = data.generatedAt.toISOString().split('T')[0];
  const slugifiedName = data.userName.replace(/\s+/g, '-');
  doc.save(`APZ-Fitness-Blueprint-${slugifiedName}-${dateSuffix}.pdf`);
}
