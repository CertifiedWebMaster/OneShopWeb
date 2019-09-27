import { _config } from '@ecomplus/utils'
import CleaveInput from 'vue-cleave-component'

const countryCode = _config.get('country_code')

export default {
  name: 'InputDocNumber',

  components: {
    CleaveInput
  },

  props: {
    value: {
      type: [String, Number],
      required: true
    },
    isCompany: {
      type: Boolean
    }
  },

  computed: {
    placeholder () {
      return countryCode === 'BR'
        ? this.isCompany
          ? 'CNPJ'
          : 'CPF'
        : null
    },

    localValue: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('input', value)
      }
    },

    cleaveOptions () {
      return countryCode === 'BR'
        ? this.isCompany
          ? { blocks: [2, 3, 3, 4, 2], delimiters: ['.', '.', '/', '-'] }
          : { blocks: [3, 3, 3, 2], delimiters: ['.', '.', '-'] }
        : { blocks: [30] }
    }
  }
}
