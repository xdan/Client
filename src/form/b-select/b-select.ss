- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'form/b-input'|b as placeholder

- template index() extends ['b-input'].index
	- block icons
		< _.&__cell.&__icon.&__expand @click = setMod('opened', true)
			< b-icon :value = 'expand_more' | v-once

	- block input
		- super
		< select.&__native &
			ref = select |
			v-if = b.is.mobile |
			v-model = selectedStore |
			@focus = onFocus |
			@blur = onBlur |
			@change = onOptionSelected($event.target.dataset.value)
		.
			< option v-for = el in options | :key = :value, getOptionValue(el)
				{{ el.label }}

	- block helpers
		- super
		- block dropdown
			< _.&__dropdown[.&_pos_bottom-left] v-if = !b.is.mobile && options.length && ifOnce('opened', mods.opened !== 'false')
				< _.&__dropdown-content
					< _.&__dropdown-content-wrapper
						< b-scroll-inline.&__scroll &
							ref = scroll |
							:fixSize = true |
							:mods = provideMods({size: 'm'})
						.
							< _ &
								v-for = el in options |
								:key = :-value, getOptionValue(el) |
								:class = getElClasses({
									option: {
										marked: el.marked,
										selected: isSelected(el)
									}
								})
							.

								< template v-if = $scopedSlots.default
									< slot :el = el | ${slotAttrs|!html}

								< template v-else-if = option
									< component :is = option | :p = el

								< template v-else
									{{ t(el.label) }}