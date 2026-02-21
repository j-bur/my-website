import type { SurgeTableEntry } from '../types';

export const WILD_ECHO_SURGE_TABLE: SurgeTableEntry[] = [
  {
    roll: 1,
    extreme: 'A fireball explodes with you at the center. You and each creature within 20 feet of you who must make a Dexterity saving throw using your spell save DC, taking 5d6 fire damage on a failed save, or half as much damage on a successful one.',
    moderate: 'For the next 8 hours, you constantly leak grease where you are standing, filling a 10-foot radius circle every six seconds. You and anyone within 10 feet of you must make a DC 16 Dexterity check or fall prone.',
    nuisance: 'For the next 24 hours, your skin tone changes color every 30 minutes, cycling through the colors of the rainbow. You emanate 30 feet of bright light, and dim light for another 30 feet, as well as a humming chime that is audible up to 120 feet away.'
  },
  {
    roll: 2,
    extreme: 'You gain the benefits of a short rest. You may not expend hit dice.',
    moderate: 'You are confused for 1 minute, as though you were affected by the confusion spell.',
    nuisance: 'You levitate 6 inches off the ground for 1 hour.'
  },
  {
    roll: 3,
    extreme: 'You lose the ability to hear for 1 day.',
    moderate: 'Your Strength is increased by 2 for 1 day.',
    nuisance: 'You gain tremorsense with a range of 30 feet for 1 hour.'
  },
  {
    roll: 4,
    extreme: 'Each creature within 30 feet of you takes 1d10 necrotic damage. You regain hit points equal to the sum of damage dealt.',
    moderate: 'A third eye appears in your forehead, giving you advantage on sight-based Wisdom (Perception) checks for 1 hour.',
    nuisance: 'You make no sounds for 1 hour and you gain advantage on any Dexterity (Stealth) checks.'
  },
  {
    roll: 5,
    extreme: 'You teleport to an alternate plane, then return to the location where you started after 1 minute.',
    moderate: 'Your next hit turns into a critical hit.',
    nuisance: 'You grow a beard made of feathers, which remains until you sneeze.'
  },
  {
    roll: 6,
    extreme: 'You transform into a large empty barrel for 1 minute, during which time you considered petrified.',
    moderate: 'For the next minute, you can teleport up to 20 feet as part of your movement on each of your turns.',
    nuisance: 'You can\'t speak for 1 minute. When you try, pink bubbles float out of your mouth.'
  },
  {
    roll: 7,
    extreme: 'You are at the center of a darkness spell for 1 minute.',
    moderate: 'You become intoxicated for 2d6 hours.',
    nuisance: 'You are immune to intoxication for the next 5d6 days.'
  },
  {
    roll: 8,
    extreme: 'You are frightened by the nearest creature until the end of your next turn.',
    moderate: 'Your Intelligence is decreased by 2 for 1 day.',
    nuisance: 'You gain an Action Surge.'
  },
  {
    roll: 9,
    extreme: 'You are resistant to all damage types for 1 minute.',
    moderate: 'Your Wisdom is increased by 2 for 1 day.',
    nuisance: 'For the next minute, you must shout when you speak.'
  },
  {
    roll: 10,
    extreme: 'A random creature within 60 feet of you is poisoned for 1d4 hours.',
    moderate: 'For 1 minute, any flammable item you touch, that you aren\'t already wearing or carrying, bursts into flame.',
    nuisance: 'Illusory butterflies and flower petals flutter in the air around you in a 10-foot radius for 1 minute.'
  },
  {
    roll: 11,
    extreme: 'Make a Wisdom saving throw against your own save DC. If you fail, you are polymorphed into giant dragonfly for 1 minute.',
    moderate: 'Plants grow around you and you are restrained for 1 minute.',
    nuisance: 'You cast mirror image on yourself, which lasts for 1 minute and does not require concentration.'
  },
  {
    roll: 12,
    extreme: 'Up to three creatures you choose within 30 feet of you take 4d10 lightning damage.',
    moderate: 'A random creature within 30 feet of you gains a flying speed equal to its walking speed for 1 minute.',
    nuisance: 'You are surrounded by faint, ethereal music for 1 minute.'
  },
  {
    roll: 13,
    extreme: 'You immediately gain 20 temporary hit points.',
    moderate: 'You may immediately take 1 additional action.',
    nuisance: 'You regain all expended Unleash Incarnation uses.'
  },
  {
    roll: 14,
    extreme: 'You teleport up to 60 feet to an unoccupied space that you can see.',
    moderate: 'If you fall within the next day, you automatically have the benefit of the feather fall spell.',
    nuisance: 'Your horns grow to double their current length over the next minute.'
  },
  {
    roll: 15,
    extreme: 'You are the center of a silence spell for 1 minute.',
    moderate: 'You recover 1 use of a class or subclass ability of your choice.',
    nuisance: 'Your hair falls out but grows back within 1 day.'
  },
  {
    roll: 16,
    extreme: 'You are vulnerable to fiends for 1 hour. Such creatures gain advantage on attack rolls made against you.',
    moderate: 'For the next attack within 1 minute that does damage, the damage is minimized.',
    nuisance: 'You gain the ability to speak one additional language of your choice for 1 hour.'
  },
  {
    roll: 17,
    extreme: 'For the next day, any time you make an ability check, roll 1d6 and subtract the result.',
    moderate: 'You have are surrounded by a spectral shield for 1 minute, giving you a +2 bonus to your AC and immunity to magic missile.',
    nuisance: 'You are invisible for 1 minute.'
  },
  {
    roll: 18,
    extreme: 'The next enemy that makes a saving throw within the next minute has advantage on the roll.',
    moderate: 'You and all creatures within 30 feet of you gain vulnerability to piercing damage for 1 minute.',
    nuisance: 'Your eyes permanently change color. A spell such as remove curse can end this effect.'
  },
  {
    roll: 19,
    extreme: 'You may use your Unleash Incarnation feature again.',
    moderate: 'For 1 minute, you gain resistance to nonmagical bludgeoning, piercing, and slashing damage.',
    nuisance: 'Small birds flutter and chirp in your vicinity for 1 minute, during which time you automatically fail any Stealth check.'
  },
  {
    roll: 20,
    extreme: 'A demon whose CR is equal to your level appears near you. Make a Charisma saving throw against your save DC. If you make it, the demon is subservient, otherwise, it is hostile. The demon, if not banished or defeated, vanishes after 1 day.',
    moderate: 'You are protected from Elementals for 1 hour. Such creatures cannot attack you or harm you unless they succeed on a Charisma saving throw against your save DC.',
    nuisance: 'You feel the incredible urge to relieve yourself. Until you do, your Strength and Intelligence are reduced by 1. If you don\'t relieve yourself in the next 2 minutes, the above effects are removed, but your Charisma score is reduced by 4 for 1 hour or until you change your trousers.'
  },
  {
    roll: 21,
    extreme: 'For the next minute, every creature within 60 feet of you that hears you speak only hears insults as if you are casting vicious mockery.',
    moderate: 'For the next minute, one creature of your choice gets a -2 penalty to its AC, attack rolls, and damage rolls.',
    nuisance: 'Gnats buzz around your head for 1 minute, distracting you. You must make a Constitution saving throw against your own spell save DC to cast any spell.'
  },
  {
    roll: 22,
    extreme: 'For the next day, you have advantage on the next 2d6 rolls you make where you don\'t already have advantage.',
    moderate: 'You and all creatures within 30 feet of you gain vulnerability to bludgeoning damage for 1 minute.',
    nuisance: 'You are surrounded by a faint, offensive odor for 1 minute. You gain disadvantage on all Charisma checks.'
  },
  {
    roll: 23,
    extreme: 'You are protected from Aberrations for 1 day. Such creatures cannot attack you or harm you unless they save a Charisma saving throw against your save DC.',
    moderate: 'You emanate light in a 30-foot radius for 1 minute. Any creature within 5 feet of you that can see is blinded until the end of its next.',
    nuisance: 'You fall under the effect of the slow spell.'
  },
  {
    roll: 24,
    extreme: 'For 1 minute, a duplicate of yourself appears in the nearest open space which can take actions independently, and goes on the same Initiative as you. However, any damage it takes as well as any consumable abilities it uses applies to you as well.',
    moderate: 'For the next hour, you gain advantage on Charisma checks when dealing with any creature wearing black, but disadvantage if they are wearing white. If they are wearing both, this doesn\'t apply.',
    nuisance: 'You have the irresistible urge to scratch an itch in the middle your back, just out of reach, for 1 minute. If you don\'t scratch it using a back scratcher or some similar device, you must succeed a Constitution saving throw against your spell save DC to make an attack.'
  },
  {
    roll: 25,
    extreme: 'A loud boom emanates from you. All creatures within 15 feet take 2d8 thunder damage and must make a Constitution saving throw against your spell DC or be deafened for 1 minute.',
    moderate: 'You are protected from Plants for 1 hour. Such creatures cannot attack you or harm you unless they succeed on a Charisma saving throw against your save DC.',
    nuisance: 'You have a momentary vision of your own death. If you fail a Wisdom saving roll at your spell DC, you are frightened for 1 minute.'
  },
  {
    roll: 26,
    extreme: 'All creatures within 60 feet of you regain 2d8 hit points.',
    moderate: 'Your Intelligence is increased by 2 for 1 day.',
    nuisance: 'Your Charisma is increased by 2 for 1 minute.'
  },
  {
    roll: 27,
    extreme: 'For the next minute, all rolls made with advantage are instead made with disadvantage, and vice versa.',
    moderate: 'Within the next hour, you have advantage on the next roll you make where you don\'t already have advantage.',
    nuisance: 'Over the next minute, all plants within 20 feet of you grow as if affected by the plant growth spell when cast as an action.'
  },
  {
    roll: 28,
    extreme: 'You are immune to disease for 1 week.',
    moderate: 'You gain a +2 bonus to your AC for 1 minute.',
    nuisance: 'Your eyes glow red for 1 minute.'
  },
  {
    roll: 29,
    extreme: 'You immediately drop to 0 hit points.',
    moderate: 'For the next minute, you are in the Border Ethereal near the location you were last in.',
    nuisance: 'Your Constitution is increased by 2 for 1 minute.'
  },
  {
    roll: 30,
    extreme: 'Make a Wisdom saving throw against your own save DC. If you fail, you are transformed into a raven for 1 minute, as if by a polymorph spell.',
    moderate: 'For the next minute, you gain resistance to thunder and force damage.',
    nuisance: 'You add your proficiency bonus to all Charisma checks for the next hour, if you don\'t already add it.'
  },
  {
    roll: 31,
    extreme: 'You are protected from Beasts for 1 day. Such creatures cannot attack you or harm you unless they save a Charisma saving throw against your spell save DC.',
    moderate: 'An imp appears within 30 feet of you. Make a Charisma saving throw against your save DC. If you succeed it, the imp is subservient, otherwise, it is hostile. The imp, if not banished or defeated, vanishes after 1 day.',
    nuisance: 'You and one enemy of your choice within 30 feet swap weapons.'
  },
  {
    roll: 32,
    extreme: 'You transform into a stuffed toy resembling yourself for 1 minute, during which time you are considered petrified.',
    moderate: 'For the next minute, you gain resistance to fire and cold damage.',
    nuisance: 'For the next minute, you have advantage on the next roll you make where you don\'t already have advantage.'
  },
  {
    roll: 33,
    extreme: 'You stand at the center a circular wall of fire with a radius of 15 feet. Any creature in any of the spaces covered by this fire must make a Dexterity saving throw against your save DC or take 5d8 fire damage. The wall of fire remains for 1 minute.',
    moderate: 'For the next hour, you gain advantage on Charisma checks when dealing with any creature wearing red, but disadvantage if they are wearing green. If they are wearing both, this doesn\'t apply.',
    nuisance: 'Every creature within 15 feet of you takes 1 necrotic damage. If you are wounded, you regain hit points up to the amount of damage dealt. If you are not wounded, you gain this amount of temporary hit points.'
  },
  {
    roll: 34,
    extreme: 'Choose 1 permanent or triggered effect that has happened to you or somebody else that you\'ve received from this chart and remove it, even if it was beneficial.',
    moderate: 'You gain the service of an arcane eye for 1 hour that does not require concentration.',
    nuisance: 'A magic mouth appears on a nearby wall or flat surface. When you speak, your voice comes from the magic mouth. This lasts for 1 minute.'
  },
  {
    roll: 35,
    extreme: 'You are vulnerable to Beasts for 1 hour. Such creatures gain advantage when attacking you.',
    moderate: 'You lose the ability to smell for 1 day.',
    nuisance: 'You can hear exceptionally well for 1 hour, gaining advantage for all Perception checks related to sound.'
  },
  {
    roll: 36,
    extreme: 'You permanently lose the ability to smell. This sense can be restored with a spell that removes curses such as remove curse.',
    moderate: 'You gain a -2 penalty to your AC for 1 minute.',
    nuisance: 'You lose the ability to smell for 1 hour.'
  },
  {
    roll: 37,
    extreme: 'You are vulnerable to Celestials for 1 hour. Such creatures gain advantage when attacking you.',
    moderate: 'You and all creatures within 30 feet of you gain vulnerability to necrotic damage for 1 minute.',
    nuisance: 'For the next day, each time you say a word with the "s" sound, it sounds like a hissing snake.'
  },
  {
    roll: 38,
    extreme: 'Make a Wisdom saving throw against your spell save DC. If you fail, you are transformed into a cat for 1 minute, as if by a polymorph spell.',
    moderate: 'You become invisible and silent for 1 minute.',
    nuisance: 'A gentle gust of wind blows outward from you. All creatures within 40 feet of you can feel it, but it otherwise does nothing.'
  },
  {
    roll: 39,
    extreme: 'You are vulnerable to Plants for 1 hour. Such creatures gain advantage when attacking you.',
    moderate: 'Your Dexterity is increased by 2 for 1 day.',
    nuisance: 'Your Dexterity is increased by 2 for 1 minute.'
  },
  {
    roll: 40,
    extreme: 'You gain the service of an arcane eye for 1 hour that does not require concentration.',
    moderate: 'You can detect the thoughts of 1 creature you can see within 30 feet of you for 1 hour.',
    nuisance: 'You immediately take 1d10 radiant damage.'
  },
  {
    roll: 41,
    extreme: 'You are protected from Celestials for 1 day. Such creatures cannot attack you or harm you unless they succeed on a Charisma saving throw against your save DC.',
    moderate: 'For the next minute, all melee attacks you make with a non-magical weapon gain a +1 bonus to hit and to damage, and are considered magical for the purpose of overcoming resistances.',
    nuisance: 'One randomly-chosen non-magical item in your possession that weighs 1 pound or less vanishes and is forever gone.'
  },
  {
    roll: 42,
    extreme: 'You transform into a medium-sized potted plant for 1 minute, during which time you are considered petrified.',
    moderate: 'Your Strength is decreased by 2 for 1 hour.',
    nuisance: 'Your Wisdom is increased by 2 for 1 minute.'
  },
  {
    roll: 43,
    extreme: '3d6 random gems appear near you, worth 50gp each.',
    moderate: 'You gain freedom of movement 24 hours.',
    nuisance: 'You immediately gain 10 temporary hit points.'
  },
  {
    roll: 44,
    extreme: 'All allies within 20 feet of you gain a +2 bonus to attack and damage rolls on any melee weapon attack they make within the next minute.',
    moderate: 'Your Dexterity is decreased by 2 for 1 hour.',
    nuisance: '3d6 silver pieces appear near you.'
  },
  {
    roll: 45,
    extreme: 'For 2d6 hours, you glow bright yellow. You have disadvantage on Stealth checks and anyone trying to perceive you has advantage on their Perception check.',
    moderate: 'You are affected by a faerie fire spell for 1 minute. You automatically fail the saving throw.',
    nuisance: 'You regain 5 hit points per round for 1 minute.'
  },
  {
    roll: 46,
    extreme: 'You stand at the center a circular wall of force with a radius of 15 feet. Any creature in any of the spaces covered by this wall must make a Dexterity saving throw against your save DC or take 5d8 force damage. The wall remains for 1 minute.',
    moderate: 'You are protected from Beasts for 1 hour. Such creatures cannot attack you or harm you unless they succeed a Charisma saving throw against your save DC.',
    nuisance: 'An imp appears near you. Make a Charisma saving throw against your save DC. If you succeed, the imp is subservient, otherwise, it is hostile. The imp, if not banished or defeated, vanishes after 1 hour.'
  },
  {
    roll: 47,
    extreme: 'All creatures within 20 feet of you are knocked prone.',
    moderate: '3d6 gold pieces appear near you.',
    nuisance: 'Your speed is increased by 10 feet for 1 minute.'
  },
  {
    roll: 48,
    extreme: 'You are vulnerable to Aberrations for 1 hour. Such creatures gain advantage when attacking you.',
    moderate: 'For 2d6 hours, you have a faint pink glow. Anyone trying to perceive you has advantage on their Perception check.',
    nuisance: 'You gain proficiency on all Intelligence checks for the next hour.'
  },
  {
    roll: 49,
    extreme: 'For the next day, you are in the Border Ethereal near the location you were last in.',
    moderate: 'You gain the ability to breath water for 1 day.',
    nuisance: 'Your Intelligence is increased by 2 for 1 minute.'
  },
  {
    roll: 50,
    extreme: 'All allies within 20 feet of you gain a +2 bonus to attack and damage rolls on any weapon attack they make within the next minute.',
    moderate: 'You and all creatures within 30 feet of you gain vulnerability to slashing damage for 1 minute.',
    nuisance: 'One randomly-chosen non-magical item in your possession that weighs 1 pound or less is duplicated.'
  },
  {
    roll: 51,
    extreme: 'You are at the center of a 10-foot radius antimagic field that negates all magic equal to or less than your level for 1 hour and does not require concentration.',
    moderate: 'For the next minute, light and darkness quickly alternate around you in a 30-foot radius, creating a strobe effect. Sight-based creatures gain a -1 penalty on attack rolls against you and Perception checks against you, and you gain a +1 bonus to Stealth checks.',
    nuisance: 'Mushrooms sprout around you in a 5-foot radius and vanish after 1 minute. If one is harvested and eaten within this time, the creature must make a Constitution saving throw against your spell save DC. On a failed save, it takes 5d6 poison damage. On successful one, it gains 5d6 temporary hit points.'
  },
  {
    roll: 52,
    extreme: 'Make a Wisdom saving throw against your save DC. If you fail, you are transformed into a wolf for 1 minute, as if by a polymorph spell.',
    moderate: 'All creatures within 20 feet of you must make a Strength saving throw against your save DC or be knocked prone.',
    nuisance: 'You can smell exceptionally well for 1 minute, gaining blindsight with a radius of 10 feet and advantage on all Perception checks related to odor.'
  },
  {
    roll: 53,
    extreme: 'You are protected from Elementals for one day. Such creatures cannot attack you or harm you unless they succeed on a Charisma saving throw against your save DC.',
    moderate: 'You are protected from Undead for one hour. Such creatures cannot attack you or harm you unless they succeed on a Charisma saving throw against your DC.',
    nuisance: 'Your feet sink into the ground, making you completely immobile for one minute. This has no effect if you were not standing on the ground when the spell was cast.'
  },
  {
    roll: 54,
    extreme: 'Your horns permanently fall off. Only a spell such as remove curse can end this effect.',
    moderate: 'For the next minute, you can pass through any solid, non-magical wall that is 6 or fewer inches thick.',
    nuisance: 'One random gem worth 100gp appears near you.'
  },
  {
    roll: 55,
    extreme: 'You gain the ability to speak one new language of your choice. However, you lose the ability to speak one language you already know.',
    moderate: 'You are protected from Fiends for one hour. Such creatures cannot attack you or harm you unless they succeed on a Charisma save against your save DC.',
    nuisance: 'For the next minute, you have double vision. This gives you disadvantage on ranged attacks and Perception checks involving sight.'
  },
  {
    roll: 56,
    extreme: 'A 30-foot cube hypnotic pattern appears with you at the center. All creatures within the pattern must succeed on a Wisdom saving throw or fall asleep for 1 minute or until they take damage.',
    moderate: 'You permanently gain one 1st-level spell slot but forget one cantrip that you already know. A spell such as remove curse can end this effect.',
    nuisance: 'You are surrounded by a faint, pleasant odor. You gain advantage on all Charisma checks you make within the next minute.'
  },
  {
    roll: 57,
    extreme: 'You permanently forget one cantrip. A spell such as remove curse can restore your memory.',
    moderate: 'You immediately gain 15 temporary hit points.',
    nuisance: 'You lose proficiency on all skill checks for 1 minute.'
  },
  {
    roll: 58,
    extreme: 'You immediately take 2d10 psychic damage.',
    moderate: 'All gold you are carrying is now silver.',
    nuisance: 'You gain freedom of movement for 1 minute.'
  },
  {
    roll: 59,
    extreme: 'You are vulnerable to Undead for 1 hour. Such creatures gain advantage when attacking you.',
    moderate: 'For the next minute, you gain resistance to necrotic and radiant damage.',
    nuisance: 'You lose darkvision for 1 minute.'
  },
  {
    roll: 60,
    extreme: 'You transform into an iron statue of yourself for 1 minute, during which time you are considered petrified.',
    moderate: 'You are at the center of a fog cloud spell which lasts for 1 minute.',
    nuisance: 'Approximately 100 gallons of water appear over your head and those within 10 feet of you, evenly distributed above everybody within the radius.'
  },
  {
    roll: 61,
    extreme: 'You gain one maximum action surge for 1 week.',
    moderate: 'Your Charisma is increased by 2 for 1 day.',
    nuisance: 'You gain a +1 to your AC for one minute.'
  },
  {
    roll: 62,
    extreme: 'If you die within the next minute, you come back to life as if by the reincarnate spell.',
    moderate: 'You and all creatures within 30 feet of you gain vulnerability to lightning damage for 1 minute.',
    nuisance: 'You fall victim to a horrible cramp in both legs, reducing your speed by 10 feet for 1 hour.'
  },
  {
    roll: 63,
    extreme: 'You permanently gain one maximum Unleash Incarnation use, but only gain Second Wind after a long rest. A spell such as remove curse can end this effect.',
    moderate: 'You and all creatures within 30 feet of you gain vulnerability to force damage for 1 minute.',
    nuisance: 'You gain one free use of Unleash Incarnation.'
  },
  {
    roll: 64,
    extreme: 'All creatures that can perceive you must make a Wisdom saving throw against your save DC or be frightened of you.',
    moderate: 'For the next minute, any creature you touch takes 2d6 lightning damage.',
    nuisance: 'For the next hour, you are unable to read as the letters all appeared jumbled.'
  },
  {
    roll: 65,
    extreme: 'You are vulnerable to Elementals for 1 hour. Such creatures gain advantage when attacking you.',
    moderate: 'You gain blindsight with a radius of 60 feet for 1 minute.',
    nuisance: 'For the next day, everything you say must rhyme. If it doesn\'t, you take 1d6 psychic damage.'
  },
  {
    roll: 66,
    extreme: 'You are protected from Fey for 1 day. Such creatures cannot attack you or harm you unless they succeed on a Charisma saving throw against your save DC.',
    moderate: 'You are surrounded by a horrible, noxious odor for 1 minute. Anyone within 10 feet of you must make a Constitution saving throw or be stunned.',
    nuisance: 'During the next hour, you may re-roll any one save, attack roll, or skill check. If you do, you must take the new roll\'s result.'
  },
  {
    roll: 67,
    extreme: 'You gain the service of an arcane sword that does not require concentration until your next short or long rest.',
    moderate: 'Your Charisma is decreased by 2 for 1 hour.',
    nuisance: 'You grow 1d6 inches in height. You gradually return to your original height over the course of 1 day.'
  },
  {
    roll: 68,
    extreme: 'You permanently gain one cantrip. A spell such as remove curse can end this effect.',
    moderate: 'You gain the service of a phantom steed for 1 day.',
    nuisance: 'A creature within 5 feet of you immediately takes 2d4 psychic damage.'
  },
  {
    roll: 69,
    extreme: 'All allies within 20 feet of you get gain a -2 penalty on attack and damage rolls for any melee attack they make in the next minute.',
    moderate: 'You and all creatures within 30 feet of you gain vulnerability to acid damage for 1 minute.',
    nuisance: 'For the next hour, any time you make an ability check, roll 1d4 and subtract the result.'
  },
  {
    roll: 70,
    extreme: 'All allies within 20 feet of you heal up to 3d8 hit points.',
    moderate: 'Your Wisdom is decreased by 2 for 1 hour.',
    nuisance: 'You gain the ability to speak with animals for one hour.'
  },
  {
    roll: 71,
    extreme: 'You lose the ability to see for 1 day. During this time, you have the blinded condition.',
    moderate: 'Your speed is increased by 10 feet for 1 day.',
    nuisance: 'You get gain a -1 penalty to your AC for 1 minute.'
  },
  {
    roll: 72,
    extreme: 'You gain the service of a phantom steed for 1 week.',
    moderate: 'You gain the ability to walk on water for 1 day.',
    nuisance: 'You gain the use of an unseen servant for 1 hour.'
  },
  {
    roll: 73,
    extreme: 'Make a Constitution saving throw against your save DC. If you fail, you are stunned for 1 minute or until an ally uses the help action on you.',
    moderate: 'You and all creatures within 30 feet of you gain vulnerability to psychic damage for 1 minute.',
    nuisance: 'The next spell you cast within the hour uses a slot level one level higher than what it normally requires.'
  },
  {
    roll: 74,
    extreme: 'You gain Stoneskin for 1 minute, and it does not require concentration to maintain.',
    moderate: 'One creature of your choice gets a +2 bonus to all attack rolls, damage rolls, and their armor class AC for 1 minute.',
    nuisance: 'A bad joke comes to mind and until you tell it (which takes an entire action), you suffer a Wisdom penalty of 1.'
  },
  {
    roll: 75,
    extreme: 'All creatures within 20 feet of you, including you, must make a Dexterity save against your spell save DC or be affected by a faerie fire spell.',
    moderate: 'You lose proficiency in one randomly chosen skill, tool, or weapon type for 2d6 days.',
    nuisance: 'You hear a ringing in your ears for 1 minute. During this time, perception checks that rely on sound requires a Constitution check against your save DC.'
  },
  {
    roll: 76,
    extreme: 'Permanently increase one ability score of your choice by 1 point. Permanently decrease a different ability score of your choice by 1 point. A spell such as remove curse can end this effect.',
    moderate: 'All food and drink within 30 feet of you becomes putrid, spoiled, or rotten. Consuming this food deals 2d6 poison damage and causes the poisoned condition for 1 hour.',
    nuisance: 'You lose 1d6x5 pounds. You gradually return to your original weight over the course of 1 day.'
  },
  {
    roll: 77,
    extreme: 'You gain proficiency in one tool or weapon type you don\'t already have for 1 week.',
    moderate: 'All silver you are carrying is now copper.',
    nuisance: 'Your clothes become dirty and filthy. Until you can change and/or clean your clothes, your Charisma is reduced by 1.'
  },
  {
    roll: 78,
    extreme: 'Make a Wisdom saving throw against your save DC. If you fail, you are transformed into a giant spider for 1 minute, as if by the polymorph spell.',
    moderate: 'You and all creatures within 30 feet of you gain vulnerability to fire damage for 1 minute.',
    nuisance: 'You gain proficiency in Wisdom checks for the next hour.'
  },
  {
    roll: 79,
    extreme: 'Gain the sympathy effects of the antipathy/sympathy spell for 3d6 days.',
    moderate: 'You lose proficiency in all skill checks for 1d4 hours.',
    nuisance: 'You shrink 1d6 inches in height. You gradually return to your original height over the course of 1 day.'
  },
  {
    roll: 80,
    extreme: 'You are protected from Fiends for one day. Such creatures cannot attack you or harm you unless they succeed on a Charisma saving throw against your save DC.',
    moderate: 'You are protected from Fey for one hour. Such creatures cannot attack you or harm you unless they succeed on a Charisma saving throw against your save DC.',
    nuisance: 'Your skin permanently darkens as if you have a tan, or if you are already dark-skinned, your skin becomes one shade lighter. A spell such as remove curse can end this effect.'
  },
  {
    roll: 81,
    extreme: 'All allies within 20 feet of you gain a -2 penalty to attack and damage rolls for any ranged attack they make within the next minute.',
    moderate: 'For the next hour, any time you make an ability check, roll 1d6 and subtract the result.',
    nuisance: 'For 1 minute, one creature of your choice within 30 feet of you gains a -1 penalty to attack rolls, damage rolls, and their AC.'
  },
  {
    roll: 82,
    extreme: 'You may immediately cast any one spell up to second level.',
    moderate: 'For the next minute, you gain resistance to poison and psychic damage.',
    nuisance: 'For the next hour, any time you make an ability check, roll 1d4 and add the result.'
  },
  {
    roll: 83,
    extreme: 'Make a Wisdom saving throw against your save DC. If you fail, you are transformed into a giant rabbit for 1 minute, as if by the polymorph',
    moderate: 'You\'re feeling lucky. For the next hour, any time you make an ability check, roll 1d6 and add the result.',
    nuisance: 'You give a target within 30 feet disadvantage on its next saving throw.'
  },
  {
    roll: 84,
    extreme: 'You permanently learn an Artificer cantrip.',
    moderate: 'You immediately take 2d6 psychic damage.',
    nuisance: 'Your Strength is increased by 2 for 1 minute.'
  },
  {
    roll: 85,
    extreme: 'For the next day, you gain proficiency in all skills that you are not already proficient in.',
    moderate: 'You gain proficiency in one skill of your choice that you\'re not already proficient in for one hour.',
    nuisance: 'One creature of your choice gains a +1 bonus to attack rolls, damage rolls, and its AC for 1 minute.'
  },
  {
    roll: 86,
    extreme: 'The next time you roll on this chart, roll twice. Both effects will apply.',
    moderate: 'Your Constitution is increased by 2 for 1 day.',
    nuisance: 'You immediately heal 2d10 hit points.'
  },
  {
    roll: 87,
    extreme: 'You are vulnerable to Fey for 1 hour. Such creatures gain advantage when attacking you.',
    moderate: 'You and all creatures within 30 feet of you gain vulnerability to thunder damage for 1 minute.',
    nuisance: 'You gain proficiency on all Intelligence checks for the next hour, if you don\'t already have it.'
  },
  {
    roll: 88,
    extreme: 'You transform into an empty wooden chest for 1 minute, during which time you are considered petrified unless you succeed on a Constitution saving throw against your save DC.',
    moderate: 'You and all creatures within 30 feet of you gain vulnerability to cold damage for 1 minute.',
    nuisance: 'Your attacks deal 1d4 additional force damage.'
  },
  {
    roll: 89,
    extreme: 'Gain the antipathy effects of the antipathy/sympathy spell for 3d6 days.',
    moderate: 'You gain the ability to speak one language of your choice for 1 day.',
    nuisance: 'You gain 1d6x10 pounds. You gradually return to your original weight over the course of 1 day.'
  },
  {
    roll: 90,
    extreme: 'All creatures within 30 feet of you must make a Wisdom saving throw. Any creature immune to magical sleep automatically succeeds on its saving throw. Those that fail fall asleep for 1d6 minutes.',
    moderate: 'You and all creatures within 30 feet of you gain vulnerability to radiant damage for 1 minute.',
    nuisance: 'You gain proficiency in all Dexterity checks for the next hour, if you don\'t already have it.'
  },
  {
    roll: 91,
    extreme: 'You are protected from Plants for 1 day. Such creatures cannot attack you or harm you unless they succeed on a Charisma saving throw against your save DC.',
    moderate: 'You are protected from Celestials for 1 hour. Such creatures cannot attack you or harm you unless they succeed on a Charisma saving throw against your save DC.',
    nuisance: 'Your fingernails and toenails grow to an uncomfortable length. Until you trim them, your Dexterity is reduced by 1 and your speed is reduced by 5 feet, even if you\'re not wearing shoes.'
  },
  {
    roll: 92,
    extreme: 'All your allies within 20 feet of you gain a +2 bonus to their AC for 1 minute.',
    moderate: 'For the next minute, you can only target creatures that are taller than you.',
    nuisance: 'You gain the effects of the blur spell for 1 minute, which does not require concentration to maintain.'
  },
  {
    roll: 93,
    extreme: 'The next time you fall below 0 hit points within the next month, you automatically fail your first death saving throw.',
    moderate: 'You gain spider climb for 1 minute, and it does not require concentration to maintain.',
    nuisance: 'For the next hour, you appear to others to be the opposite gender.'
  },
  {
    roll: 94,
    extreme: 'You gain one extra maximum Action Surge and Second Wind for 1 week.',
    moderate: 'You immediately lose all unspent Action Surge and Second Wind and may not regain them until you have finished a long rest.',
    nuisance: 'You gain the service of a 2nd-level spiritual weapon for 1 minute.'
  },
  {
    roll: 95,
    extreme: 'For the next day, any time you make an ability check, roll 1d6 and add the result.',
    moderate: 'You and all creatures within 30 feet of you gain vulnerability to poison damage for 1 minute.',
    nuisance: 'You gain one free use of the Subtle Spell metamagic.'
  },
  {
    roll: 96,
    extreme: 'Make a Wisdom saving throw against your save DC. If you fail, you are transformed into a sheep for 1 minute, as if by the polymorph spell.',
    moderate: 'You gain the ability to speak with animals for 1 day.',
    nuisance: 'You gain proficiency in all Constitution checks for the next hour, if you don\'t already have it.'
  },
  {
    roll: 97,
    extreme: 'All allies within 30 feet of you gain a -2 penalty to their AC for 1 minute.',
    moderate: 'All food and drink within 30 feet of you is purified.',
    nuisance: 'Every inanimate object that isn\'t being worn or carried within 40 feet of you becomes enshrouded with shadows for 1 minute. Enshrouded objects are considered heavily obscured.'
  },
  {
    roll: 98,
    extreme: 'You are protected from Undead for 1 day. Such creatures cannot attack you or harm you unless they succeed on a Charisma saving throw against your save DC.',
    moderate: 'You are protected from Aberrations for 1 hour. Such creatures cannot attack you or harm you unless they succeed on a Charisma saving throw against your save DC.',
    nuisance: 'Your fingers become sore for 1 minute. During this time, you must succeed on a Dexterity saving throw against your save DC make a weapon attack or drop your weapon.'
  },
  {
    roll: 99,
    extreme: 'You jump forward in time exactly 1 minute, for 1 minute. From the perspective of everyone else, you cease to exist during that time.',
    moderate: 'All your clothing and equipment teleports to the nearest open space at least 15 feet from you that you can see.',
    nuisance: 'You feel extremely nauseated. Make a Constitution saving throw against your spell DC. If you fail, you must spend your next action throwing up.'
  },
  {
    roll: 100,
    extreme: 'For the next minute, you are polymorphed into a red dragon wyrmling.',
    moderate: 'As an action within the next minute, you may exhale fire in a 15-foot cone. Each creature in that area must make a DC 14 Dexterity saving throw, taking 24 (7d6) fire damage on a failed save, or half as much damage on a successful one.',
    nuisance: 'Large dragon-like wings sprout from your back. For the next minute, you gain a fly speed of 60 feet, and you can hover.'
  }
];

// Get a surge entry by roll number
export function getSurgeEntry(roll: number): SurgeTableEntry | undefined {
  return WILD_ECHO_SURGE_TABLE.find(e => e.roll === roll);
}
