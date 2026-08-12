import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import CIDRBaseIP from './CIDRBaseIP.vue'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('CIDRBaseIP', () => {
  it('loads and renders a new CIDR question and its choices', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        json: async () => ({ ip: '192.168.1.6', suffix: 30 }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          choices: ['192.168.1.0', '192.168.1.4', '192.168.1.8'],
          answer: 1,
        }),
      })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(CIDRBaseIP)
    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(wrapper.get('h3').text()).toBe('192.168.1.6/30')
    expect(wrapper.text()).toContain('What is the Base IP?')
    expect(wrapper.findAll('button').map((button) => button.text().trim())).toEqual([
      'New Game',
      '192.168.1.0',
      '192.168.1.4',
      '192.168.1.8',
    ])
    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/new_ip')
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/generate?base=192.168.1.6&suffix=30',
    )
  })

  it('updates the score for correct and incorrect choices', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        json: async () => ({ ip: '10.0.0.1', suffix: 30 }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ choices: ['10.0.0.0', '10.0.0.4'], answer: 0 }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ ip: '10.0.0.3', suffix: 30 }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ choices: ['10.0.0.0', '10.0.0.4'], answer: 0 }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ ip: '10.0.0.2', suffix: 30 }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ choices: ['10.0.0.0', '10.0.0.4'], answer: 0 }),
      })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(CIDRBaseIP)
    await wrapper.get('button').trigger('click')
    await flushPromises()

    await wrapper.findAll('button')[1].trigger('click')
    expect(wrapper.get('h2').text()).toBe('SCORE: 1/0')
    await flushPromises()

    await wrapper.findAll('button')[2].trigger('click')
    expect(wrapper.get('h2').text()).toBe('SCORE: 1/1')
  })
})
