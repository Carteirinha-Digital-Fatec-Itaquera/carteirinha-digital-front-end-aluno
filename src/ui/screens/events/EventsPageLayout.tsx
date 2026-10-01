import PageLayout, { type PageLayoutProps } from '../../components/page/PageLayout';

/** Keep the Events/Certificates API while sharing the visual shell. */
export default function EventsPageLayout({ backTo = '/MainMenu', ...props }: PageLayoutProps) {
  return <PageLayout backTo={backTo} {...props} />;
}
