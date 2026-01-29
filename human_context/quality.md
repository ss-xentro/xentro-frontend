# 🍎🍏 Apple & Google – Digital Product Quality Checklist

## 1. Product Intent & Clarity
- [ ] Single clear problem statement (no feature bloat)
- [ ] Primary user action identifiable within 5 seconds
- [ ] Clear value proposition without onboarding friction
- [ ] No redundant flows or duplicate features
- [ ] Product solves a real, frequent user pain

---

## 2. UX & Interaction Design
- [ ] Zero dead-end screens (every screen has a next action)
- [ ] Consistent gestures, patterns, and navigation
- [ ] Touch targets ≥ 44px (Apple HIG) / 48dp (Material)
- [ ] No surprise UI behavior
- [ ] Predictable animations (not decorative-only)
- [ ] Clear system feedback for every user action
- [ ] Edge cases handled (empty, error, loading states)

---

## 3. Visual Design Quality
- [ ] Design system followed strictly
- [ ] Consistent spacing, typography, and colors
- [ ] Accessible contrast ratios (WCAG AA+)
- [ ] Typography hierarchy communicates importance clearly
- [ ] No visual noise or unnecessary elements
- [ ] Dark mode parity (not an afterthought)
- [ ] Icons and illustrations feel native, not stocky

---

## 4. Performance & Responsiveness
- [ ] App launch time < 2s (perceived)
- [ ] 60fps animations (no jank)
- [ ] Lazy loading used where needed
- [ ] Network failures gracefully handled
- [ ] Offline or poor-network fallback
- [ ] Memory leaks tested and eliminated
- [ ] Battery usage optimized

---

## 5. Accessibility (Non-Negotiable)
- [ ] Screen reader support (VoiceOver / TalkBack)
- [ ] Proper semantic labels on all controls
- [ ] Keyboard navigation works everywhere
- [ ] Motion-reduced alternatives supported
- [ ] No color-only information
- [ ] Dynamic text scaling supported

---

## 6. Platform Guidelines Compliance
### Apple (HIG)
- [ ] Uses native navigation patterns
- [ ] Respects safe areas & system gestures
- [ ] Avoids custom UI where native exists
- [ ] Privacy-first permission prompts

### Google (Material)
- [ ] Follows Material motion & spacing
- [ ] Adaptive layouts for screen sizes
- [ ] Predictable back behavior
- [ ] System theming supported

---

## 7. Security & Privacy
- [ ] Minimum data collection principle
- [ ] Clear permission explanations
- [ ] Sensitive data encrypted at rest & transit
- [ ] No silent tracking
- [ ] GDPR / consent flows implemented
- [ ] User can delete data easily

---

## 8. Error Handling & Trust
- [ ] Human-readable error messages
- [ ] No blame language (“something went wrong” ≠ OK)
- [ ] Recovery paths provided
- [ ] Logs + monitoring in place
- [ ] No crash = silent failure

---

## 9. Quality Assurance
- [ ] Tested on low-end and high-end devices
- [ ] Tested across OS versions
- [ ] Edge cases verified
- [ ] Regression tests pass
- [ ] Manual QA for core flows
- [ ] Analytics events verified

---

## 10. Delight (Apple-level polish)
- [ ] Microinteractions feel intentional
- [ ] Animations serve meaning, not ego
- [ ] Transitions guide attention
- [ ] Copy feels human, calm, and confident
- [ ] Product feels “finished”, not rushed

---

## 11. Long-Term Maintainability
- [ ] Scalable architecture
- [ ] Clear separation of concerns
- [ ] Feature flags for experiments
- [ ] Observability (metrics, logs, traces)
- [ ] Easy rollback strategy

---

## Final Gate (Launch Decision)
- [ ] Would this embarrass us in 2 years? → NO
- [ ] Would we proudly demo this on stage? → YES
- [ ] Does this respect user time & attention? → YESmake institute gmail primary key only one account per