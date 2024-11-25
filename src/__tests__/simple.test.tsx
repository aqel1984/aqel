import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

const SampleComponent: React.FC = () => <div>Hello, World!</div>

describe('Sample Test', () => {
  it('renders without crashing', () => {
    render(<SampleComponent />)
    expect(screen.getByText('Hello, World!')).toBeInTheDocument()
  })
})