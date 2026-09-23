import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, PanResponder } from 'react-native';
import Svg, { Path, Rect, Ellipse, Polygon, Line } from 'react-native-svg';
import { screenThemes } from '../theme';
import { t } from '../i18n';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CANVAS_WIDTH = SCREEN_WIDTH - 12;
// Espace vertical réservé autour du canvas : marges de navigation (App.js ~50+50),
// en-tête du tour, barre d'outils et bouton "Terminé"
const CANVAS_RESERVED = 300;
const CANVAS_HEIGHT = Math.max(280, Math.floor(SCREEN_HEIGHT - CANVAS_RESERVED));

// Tailles de pinceau
const BRUSH_SIZES = [
  { label: 'S', width: 3 },
  { label: 'M', width: 6 },
  { label: 'L', width: 12 },
];

// Formes plaçables : on sélectionne une forme puis on glisse sur le canvas
const SHAPES = [
  { key: 'circle',   glyph: '◯' },
  { key: 'square',   glyph: '▢' },
  { key: 'triangle', glyph: '△' },
  { key: 'arrow',    glyph: '➡' },
];

// Couleurs prédéfinies pour les joueurs (20 couleurs distinctes)
const PLAYER_COLORS = [
  '#FF6B6B', // rouge
  '#4ECDC4', // turquoise
  '#FFE66D', // jaune
  '#A78BFA', // violet
  '#6BCB77', // vert
  '#FF9F43', // orange
  '#54A0FF', // bleu
  '#FF6B81', // rose
  '#00CED1', // turquoise foncé
  '#F97316', // orange vif
  '#22D3EE', // cyan
  '#E879F9', // magenta
  '#34D399', // émeraude
  '#FBBF24', // ambre
  '#818CF8', // indigo
  '#F472B6', // rose vif
  '#2DD4BF', // menthe
  '#EF4444', // rouge vif
  '#A3E635', // vert lime
  '#C084FC', // lilas
];

export { PLAYER_COLORS };

function isValidCoord(n) {
  return typeof n === 'number' && isFinite(n);
}

// Pointe de flèche : triangle à l'extrémité (x2,y2) orienté selon le trait
function arrowHeadPoints(x1, y1, x2, y2, width) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len, uy = dy / len;
  const px = -uy, py = ux;
  const hl = Math.max(14, width * 2.2);
  const bw = hl * 0.45;
  const bx = x2 - ux * hl, by = y2 - uy * hl;
  return `${x2},${y2} ${bx + px * bw},${by + py * bw} ${bx - px * bw},${by - py * bw}`;
}

// Points d'échantillonnage le long d'un segment (pour la gomme)
function lerpPoints(ax, ay, bx, by, step = 10) {
  const pts = [];
  const d = Math.sqrt((bx - ax) * (bx - ax) + (by - ay) * (by - ay));
  const n = Math.max(2, Math.ceil(d / step));
  for (let i = 0; i <= n; i++) {
    pts.push({ x: ax + ((bx - ax) * i) / n, y: ay + ((by - ay) * i) / n });
  }
  return pts;
}

// Points de contact d'un trait (tracé libre ou forme) — utilisés par la gomme
function strokePoints(s) {
  if (s.shape === 'circle') {
    const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
    const rx = Math.max(s.w / 2, 1), ry = Math.max(s.h / 2, 1);
    const pts = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      pts.push({ x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) });
    }
    return pts;
  }
  if (s.shape === 'square') {
    return [
      ...lerpPoints(s.x, s.y, s.x + s.w, s.y),
      ...lerpPoints(s.x + s.w, s.y, s.x + s.w, s.y + s.h),
      ...lerpPoints(s.x + s.w, s.y + s.h, s.x, s.y + s.h),
      ...lerpPoints(s.x, s.y + s.h, s.x, s.y),
    ];
  }
  if (s.shape === 'triangle') {
    return [
      ...lerpPoints(s.x + s.w / 2, s.y, s.x + s.w, s.y + s.h),
      ...lerpPoints(s.x + s.w, s.y + s.h, s.x, s.y + s.h),
      ...lerpPoints(s.x, s.y + s.h, s.x + s.w / 2, s.y),
    ];
  }
  if (s.shape === 'arrow') {
    const head = arrowHeadPoints(s.x1, s.y1, s.x2, s.y2, s.width || 6)
      .split(' ')
      .map((p) => {
        const [x, y] = p.split(',');
        return { x: parseFloat(x), y: parseFloat(y) };
      })
      .filter((p) => isFinite(p.x) && isFinite(p.y));
    return [...lerpPoints(s.x1, s.y1, s.x2, s.y2), ...head];
  }
  // Tracé libre : parser le path SVG ("M x,y L x,y ...")
  const pts = [];
  s.path.split(' ').forEach((tok) => {
    if (tok === 'M' || tok === 'L' || !tok) return;
    const [xs, ys] = tok.split(',');
    const x = parseFloat(xs), y = parseFloat(ys);
    if (isFinite(x) && isFinite(y)) pts.push({ x, y });
  });
  return pts;
}

export default function DrawingCanvas({ strokes, onStrokeComplete, onErase, darkTheme, editable = true, playerColor }) {
  const theme = darkTheme ? screenThemes.dark : screenThemes.light;

  const [currentPath, setCurrentPath] = useState('');
  const [currentWidth, setCurrentWidth] = useState(BRUSH_SIZES[1].width);
  const [shape, setShape] = useState(null);        // forme sélectionnée (null = tracé libre)
  const [tool, setTool] = useState('draw');        // 'draw' | 'erase'
  const [shapePreview, setShapePreview] = useState(null); // aperçu de la forme en cours

  const pathRef = useRef('');
  const lastPointRef = useRef(null);
  const isDrawingRef = useRef(false);
  const shapeStartRef = useRef(null);
  const shapeEndRef = useRef(null);
  const lastEraseRef = useRef(null);

  // Refs dynamiques pour suivre les props/state qui changent (PanResponder figé à la création)
  const colorRef = useRef(playerColor || theme.text);
  const widthRef = useRef(BRUSH_SIZES[1].width);
  const onStrokeCompleteRef = useRef(onStrokeComplete);
  const onEraseRef = useRef(onErase);
  const strokesRef = useRef(strokes);
  const toolRef = useRef('draw');
  const shapeRef = useRef(null);

  // Mettre à jour les refs quand les props changent
  useEffect(() => {
    colorRef.current = playerColor || theme.text;
  }, [playerColor, theme.text]);

  useEffect(() => {
    widthRef.current = currentWidth;
  }, [currentWidth]);

  useEffect(() => {
    onStrokeCompleteRef.current = onStrokeComplete;
  }, [onStrokeComplete]);

  useEffect(() => {
    onEraseRef.current = onErase;
  }, [onErase]);

  useEffect(() => {
    strokesRef.current = strokes;
  }, [strokes]);

  useEffect(() => {
    toolRef.current = tool;
  }, [tool]);

  useEffect(() => {
    shapeRef.current = shape;
  }, [shape]);

  // Gomme : supprimer le premier trait (du haut) touché par le doigt
  const eraseAt = (cx, cy) => {
    const arr = strokesRef.current || [];
    for (let i = arr.length - 1; i >= 0; i--) {
      const s = arr[i];
      const threshold = 16 + (s.width || 4);
      const pts = strokePoints(s);
      for (const p of pts) {
        const dx = p.x - cx, dy = p.y - cy;
        if (Math.sqrt(dx * dx + dy * dy) <= threshold) {
          onEraseRef.current?.(s);
          return;
        }
      }
    }
  };

  // Valider la forme placée (start → end) et revenir au tracé libre
  const commitShape = (start, end) => {
    const key = shapeRef.current;
    const x = Math.min(start.x, end.x), y = Math.min(start.y, end.y);
    const w = Math.abs(end.x - start.x), h = Math.abs(end.y - start.y);
    const dist = Math.sqrt(w * w + h * h);
    if (dist < 12) return; // trop petit → tap ignoré

    const color = colorRef.current;
    const width = widthRef.current;
    let stroke = null;
    if (key === 'circle')   stroke = { shape: 'circle',   x, y, w, h, color, width };
    if (key === 'square')   stroke = { shape: 'square',   x, y, w, h, color, width };
    if (key === 'triangle') stroke = { shape: 'triangle', x, y, w, h, color, width };
    if (key === 'arrow')    stroke = { shape: 'arrow', x1: start.x, y1: start.y, x2: end.x, y2: end.y, color, width };

    if (stroke) {
      onStrokeCompleteRef.current?.(stroke);
      setShape(null); // revenir au crayon après placement
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => editable,
      onMoveShouldSetPanResponder: () => editable,
      onPanResponderGrant: (evt) => {
        if (!editable) return;
        const { locationX, locationY } = evt.nativeEvent;
        if (!isValidCoord(locationX) || !isValidCoord(locationY)) return;

        const cx = Math.max(0, Math.min(locationX, CANVAS_WIDTH));
        const cy = Math.max(0, Math.min(locationY, CANVAS_HEIGHT));

        isDrawingRef.current = true;
        lastEraseRef.current = null;

        if (toolRef.current === 'erase') {
          eraseAt(cx, cy);
          lastEraseRef.current = { x: cx, y: cy };
          return;
        }
        if (shapeRef.current) {
          shapeStartRef.current = { x: cx, y: cy };
          shapeEndRef.current = { x: cx, y: cy };
          return;
        }

        pathRef.current = `M ${cx.toFixed(1)},${cy.toFixed(1)}`;
        lastPointRef.current = { x: cx, y: cy };
        setCurrentPath(pathRef.current);
      },
      onPanResponderMove: (evt) => {
        if (!editable || !isDrawingRef.current) return;
        const { locationX, locationY } = evt.nativeEvent;
        if (!isValidCoord(locationX) || !isValidCoord(locationY)) return;

        const cx = Math.max(0, Math.min(locationX, CANVAS_WIDTH));
        const cy = Math.max(0, Math.min(locationY, CANVAS_HEIGHT));

        // Gomme : effacer au fil du glissement
        if (toolRef.current === 'erase') {
          const last = lastEraseRef.current;
          if (last) {
            const dx = cx - last.x, dy = cy - last.y;
            if (Math.sqrt(dx * dx + dy * dy) < 6) return;
          }
          eraseAt(cx, cy);
          lastEraseRef.current = { x: cx, y: cy };
          return;
        }

        // Forme : aperçu en direct
        if (shapeRef.current && shapeStartRef.current) {
          const start = shapeStartRef.current;
          shapeEndRef.current = { x: cx, y: cy };
          setShapePreview({
            shape: shapeRef.current,
            x: Math.min(start.x, cx), y: Math.min(start.y, cy),
            w: Math.abs(cx - start.x), h: Math.abs(cy - start.y),
            x1: start.x, y1: start.y, x2: cx, y2: cy,
            color: colorRef.current,
            width: widthRef.current,
          });
          return;
        }

        // Tracé libre
        if (lastPointRef.current) {
          const dx = cx - lastPointRef.current.x;
          const dy = cy - lastPointRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 2) return;
        }

        pathRef.current += ` L ${cx.toFixed(1)},${cy.toFixed(1)}`;
        lastPointRef.current = { x: cx, y: cy };
        setCurrentPath(pathRef.current);
      },
      onPanResponderRelease: () => {
        if (!editable) return;
        if (toolRef.current === 'erase') {
          // rien à valider
        } else if (shapeRef.current && shapeStartRef.current) {
          commitShape(shapeStartRef.current, shapeEndRef.current || shapeStartRef.current);
        } else if (isDrawingRef.current && pathRef.current && pathRef.current.length > 5) {
          onStrokeCompleteRef.current?.({
            path: pathRef.current,
            color: colorRef.current,
            width: widthRef.current,
          });
        }
        pathRef.current = '';
        lastPointRef.current = null;
        shapeStartRef.current = null;
        shapeEndRef.current = null;
        lastEraseRef.current = null;
        isDrawingRef.current = false;
        setCurrentPath('');
        setShapePreview(null);
      },
      onPanResponderTerminate: () => {
        pathRef.current = '';
        lastPointRef.current = null;
        shapeStartRef.current = null;
        shapeEndRef.current = null;
        lastEraseRef.current = null;
        isDrawingRef.current = false;
        setCurrentPath('');
        setShapePreview(null);
      },
    })
  ).current;

  // Rendu d'un trait (tracé libre ou forme) en éléments SVG
  const renderStroke = (s, key, opacity = 1) => {
    const common = { stroke: s.color, strokeWidth: s.width, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round', opacity };
    if (s.shape === 'circle') {
      return <Ellipse key={key} cx={s.x + s.w / 2} cy={s.y + s.h / 2} rx={Math.max(s.w / 2, 1)} ry={Math.max(s.h / 2, 1)} {...common} />;
    }
    if (s.shape === 'square') {
      return <Rect key={key} x={s.x} y={s.y} width={Math.max(s.w, 1)} height={Math.max(s.h, 1)} {...common} />;
    }
    if (s.shape === 'triangle') {
      return <Polygon key={key} points={`${s.x + s.w / 2},${s.y} ${s.x + s.w},${s.y + s.h} ${s.x},${s.y + s.h}`} {...common} />;
    }
    if (s.shape === 'arrow') {
      return (
        <React.Fragment key={key}>
          <Line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} {...common} />
          <Polygon points={arrowHeadPoints(s.x1, s.y1, s.x2, s.y2, s.width)} fill={s.color} stroke={s.color} strokeWidth={1} opacity={opacity} />
        </React.Fragment>
      );
    }
    return <Path key={key} d={s.path} {...common} />;
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.canvasWrapper,
          {
            backgroundColor: theme.drawCanvasBg,
            borderColor: theme.drawCanvasBorder,
          },
        ]}
      >
        <View style={styles.canvasInner} {...(editable ? panResponder.panHandlers : {})}>
          <Svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT} pointerEvents={editable ? 'none' : 'box-none'}>
            <Rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill={theme.drawCanvasBg} />
            {strokes.map((stroke, i) => renderStroke(stroke, `s-${i}`))}
            {shapePreview ? renderStroke(shapePreview, 'preview', 0.7) : null}
            {currentPath && currentPath.length > 3 ? (
              <Path
                d={currentPath}
                stroke={colorRef.current}
                strokeWidth={widthRef.current}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.7}
              />
            ) : null}
          </Svg>
        </View>
      </View>

      {editable && (
        <View style={[styles.toolbar, { backgroundColor: theme.drawToolbarBg, borderColor: theme.drawCanvasBorder }]}>
          {/* Indicateur couleur du joueur */}
          {playerColor && (
            <View style={styles.playerColorRow}>
              <View style={[styles.playerColorDot, { backgroundColor: playerColor }]} />
              <Text style={[styles.playerColorLabel, { color: theme.text }]}>{t('drawYourColor')}</Text>
            </View>
          )}

          <View style={styles.sizeRow}>
            {BRUSH_SIZES.map((size) => (
              <TouchableOpacity
                key={size.label}
                style={[
                  styles.sizeBtn,
                  tool === 'draw' && currentWidth === size.width && { backgroundColor: theme.drawColorActive },
                  { borderColor: theme.border },
                ]}
                onPress={() => { setTool('draw'); setCurrentWidth(size.width); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.sizeLabel, { color: tool === 'draw' && currentWidth === size.width ? '#000' : theme.text }]}>
                  {size.label}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Formes */}
            {SHAPES.map((sh) => (
              <TouchableOpacity
                key={sh.key}
                accessibilityLabel={`${t('drawShape')} ${sh.glyph}`}
                accessibilityRole="button"
                style={[
                  styles.shapeBtn,
                  shape === sh.key && { backgroundColor: theme.drawColorActive },
                  { borderColor: theme.border },
                ]}
                onPress={() => { setTool('draw'); setShape(shape === sh.key ? null : sh.key); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.shapeLabel, { color: shape === sh.key ? '#000' : theme.text }]}>
                  {sh.glyph}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Gomme */}
            {onErase && (
              <TouchableOpacity
                style={[styles.eraseBtn, tool === 'erase' && { backgroundColor: theme.drawColorActive }, { borderColor: theme.border }]}
                accessibilityLabel={t('drawEraser')}
                accessibilityRole="button"
                onPress={() => { setTool(tool === 'erase' ? 'draw' : 'erase'); setShape(null); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.eraseLabel, { color: tool === 'erase' ? '#000' : theme.text }]}>
                  🧽 {t('drawEraser')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  canvasWrapper: {
    borderWidth: 2,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  canvasInner: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  },
  toolbar: {
    marginTop: 6,
    marginHorizontal: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  playerColorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  playerColorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  playerColorLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    letterSpacing: 1,
  },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  sizeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeLabel: {
    fontFamily: 'BebasNeue',
    fontSize: 14,
    letterSpacing: 1,
  },
  shapeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shapeLabel: {
    fontSize: 15,
    lineHeight: 20,
  },
  eraseBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eraseLabel: {
    fontFamily: 'BebasNeue',
    fontSize: 13,
    letterSpacing: 1,
  },
});