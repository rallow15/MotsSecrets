import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, PanResponder } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { screenThemes } from '../theme';
import { t } from '../i18n';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CANVAS_WIDTH = SCREEN_WIDTH - 8;
const CANVAS_HEIGHT = Math.floor(Math.min(SCREEN_HEIGHT * 0.65, SCREEN_WIDTH));

// Tailles de pinceau
const BRUSH_SIZES = [
  { label: 'S', width: 3 },
  { label: 'M', width: 6 },
  { label: 'L', width: 12 },
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

export default function DrawingCanvas({ strokes, onStrokeComplete, onUndo, darkTheme, editable = true, playerColor }) {
  const theme = darkTheme ? screenThemes.dark : screenThemes.light;

  const [currentPath, setCurrentPath] = useState('');
  const [currentWidth, setCurrentWidth] = useState(BRUSH_SIZES[1].width);

  const pathRef = useRef('');
  const lastPointRef = useRef(null);
  const isDrawingRef = useRef(false);

  // Refs dynamiques pour suivre les props qui changent
  const colorRef = useRef(playerColor || theme.text);
  const widthRef = useRef(BRUSH_SIZES[1].width);
  const onStrokeCompleteRef = useRef(onStrokeComplete);

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

        pathRef.current = `M ${cx.toFixed(1)},${cy.toFixed(1)}`;
        lastPointRef.current = { x: cx, y: cy };
        isDrawingRef.current = true;
        setCurrentPath(pathRef.current);
      },
      onPanResponderMove: (evt) => {
        if (!editable || !isDrawingRef.current) return;
        const { locationX, locationY } = evt.nativeEvent;
        if (!isValidCoord(locationX) || !isValidCoord(locationY)) return;

        const cx = Math.max(0, Math.min(locationX, CANVAS_WIDTH));
        const cy = Math.max(0, Math.min(locationY, CANVAS_HEIGHT));

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
        if (isDrawingRef.current && pathRef.current && pathRef.current.length > 5) {
          onStrokeCompleteRef.current?.({
            path: pathRef.current,
            color: colorRef.current,
            width: widthRef.current,
          });
        }
        pathRef.current = '';
        lastPointRef.current = null;
        isDrawingRef.current = false;
        setCurrentPath('');
      },
      onPanResponderTerminate: () => {
        pathRef.current = '';
        lastPointRef.current = null;
        isDrawingRef.current = false;
        setCurrentPath('');
      },
    })
  ).current;

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
            {strokes.map((stroke, i) => (
              <Path
                key={`s-${i}`}
                d={stroke.path}
                stroke={stroke.color}
                strokeWidth={stroke.width}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
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
                  currentWidth === size.width && { backgroundColor: theme.drawColorActive },
                  { borderColor: theme.border },
                ]}
                onPress={() => { setCurrentWidth(size.width); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.sizeLabel, { color: currentWidth === size.width ? '#000' : theme.text }]}>
                  {size.label}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Bouton Annuler */}
            {onUndo && (
              <TouchableOpacity
                style={[styles.undoBtn, { borderColor: theme.border }]}
                onPress={onUndo}
                activeOpacity={0.7}
              >
                <Text style={[styles.undoLabel, { color: theme.text }]}>{t('drawUndo')}</Text>
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
    gap: 8,
  },
  sizeBtn: {
    paddingHorizontal: 14,
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
  undoBtn: {
    marginLeft: 8,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  undoLabel: {
    fontFamily: 'BebasNeue',
    fontSize: 14,
    letterSpacing: 1,
  },
});