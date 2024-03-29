import { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useStore } from '@/context';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import AuthService from '@/services/auth';
import { useUserStore } from '@/context/user';
import { useAuthStore } from '@/context/auth';
import { WebPlaybackSDK } from 'react-spotify-web-playback-sdk';
import Navigation from '@/layouts/partials/navigation';
import Header from '@/layouts/partials/header';
import Footer from '@/layouts/partials/footer';
import Cookies from 'js-cookie';

const DefaultLayout = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const isCollapsed = useStore((state) => state.isCollapsed);
  const accessToken = Cookies.get('access_token');
  const setUser = useUserStore((state) => state.setUser);
  const [alreadyFetched, setAlreadyFetched, getRefreshToken, setAccessToken, setRefreshToken] = useAuthStore(
    (state) => [
      state.alreadyFetched,
      state.setAlreadyFetched,
      state.getRefreshToken,
      state.setAccessToken,
      state.setRefreshToken
    ]
  );
  const navigation = useNavigate();
  const getOAuthToken: Spotify.PlayerInit['getOAuthToken'] = useCallback(
    (cb: (token: string) => void) => cb(accessToken ?? ''),
    [accessToken]
  );

  useEffect(() => {
    const check = async () => {
      const refreshToken = Cookies.get('refresh_token');
      if (!refreshToken) navigation('/auth/login');
      else {
        try {
          if (!alreadyFetched) {
            const { access_token, refresh_token, expires_in } = await getRefreshToken(refreshToken);
            access_token && setAccessToken(access_token, expires_in);
            refresh_token && setRefreshToken(refresh_token, expires_in);

            setAlreadyFetched(false);
          }

          const user = await AuthService.getProfile();
          setUser(user);
          setIsLoaded(true);
        } catch (err) {
          console.log(err);
        }
      }
    };

    check();

    // 30 minutes
    const interval = 30 * 60 * 1000;
    setInterval(() => check(), interval);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isLoaded) return <>Loading</>;

  return (
    <WebPlaybackSDK
      initialDeviceName="spotify-clone"
      connectOnInitialized={true}
      getOAuthToken={getOAuthToken}
      initialVolume={0.5}
    >
      <div className="layout">
        <div className="flex gap-2">
          <Navigation isCollapsed={isCollapsed} />
          <OverlayScrollbarsComponent
            options={{ scrollbars: { autoHide: 'leave', autoHideDelay: 600 }, overflow: { x: 'hidden' } }}
            defer
            className="flex-1 rounded-lg"
          >
            <div className="relative flex-1 min-h-full rounded-lg bg-cod-gray-500">
              <Header />
              <main className="px-2 pt-2 pb-2 lg:px-6 lg:pb-6 max-w-[1955px]">
                <Outlet />
              </main>
            </div>
          </OverlayScrollbarsComponent>
        </div>
        <Footer />
      </div>
    </WebPlaybackSDK>
  );
};

export default DefaultLayout;
